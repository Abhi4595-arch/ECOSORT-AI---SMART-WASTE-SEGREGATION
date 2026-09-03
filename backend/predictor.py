import base64
import io

import torch
import torch.nn.functional as F

from torchvision import models, transforms

from PIL import Image


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device("cpu")


# ============================================================
# MODEL
# ============================================================

MODEL_PATH = "model/eco_sort_mobilenet.pth"

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

CLASS_NAMES = checkpoint["class_names"]


model = models.mobilenet_v3_small(
    weights=None
)

model.classifier[3] = torch.nn.Linear(
    model.classifier[3].in_features,
    len(CLASS_NAMES)
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)

model.eval()


# ============================================================
# GRAD-CAM TARGET LAYER
# ============================================================

# MobileNetV3-Small feature extractor.
#
# We use the final convolutional feature layer because
# Grad-CAM needs spatial feature maps before classification.

TARGET_LAYER = model.features[-1]


# ============================================================
# IMAGE TRANSFORM
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# DISPOSAL GUIDANCE
# ============================================================

DISPOSAL_GUIDANCE = {

    "Hazardous": {
        "bin": "Hazardous Waste",
        "guidance": (
            "Do not place hazardous waste in regular bins. "
            "Use an authorized hazardous-waste collection point."
        ),
        "warning": True
    },

    "Organic": {
        "bin": "Organic Waste",
        "guidance": (
            "Place it in the organic/wet waste stream. "
            "Suitable organic waste can be composted."
        ),
        "warning": False
    },

    "Recyclable": {
        "bin": "Recyclable Waste",
        "guidance": (
            "Place it in the recyclable waste stream. "
            "Keep recyclable materials reasonably clean and dry."
        ),
        "warning": False
    }
}


# ============================================================
# CONFIDENCE THRESHOLD
# ============================================================

CONFIDENCE_THRESHOLD = 60.0


# ============================================================
# EXPLANATIONS
# ============================================================

EXPLANATIONS = {

    "Hazardous": (
        "The AI classified this item as hazardous waste. "
        "The model detected visual patterns associated with "
        "the hazardous category. Extra care is recommended "
        "during disposal."
    ),

    "Organic": (
        "The AI classified this item as organic waste. "
        "The model detected visual patterns consistent with "
        "biodegradable or food-related waste."
    ),

    "Recyclable": (
        "The AI classified this item as recyclable waste. "
        "The model detected visual patterns consistent with "
        "materials that may enter a recycling stream."
    )
}


# ============================================================
# GRAD-CAM
# ============================================================

def generate_gradcam(
    input_tensor,
    target_class
):
    """
    Generate a Grad-CAM heatmap for the predicted class.

    Returns:
        Tensor with shape [224, 224]
        containing normalized values from 0 to 1.
    """

    activations = None
    gradients = None

    # --------------------------------------------------------
    # Forward hook
    # --------------------------------------------------------

    def forward_hook(
        module,
        module_input,
        module_output
    ):
        nonlocal activations

        activations = module_output


    # --------------------------------------------------------
    # Backward hook
    # --------------------------------------------------------

    def backward_hook(
        module,
        grad_input,
        grad_output
    ):
        nonlocal gradients

        gradients = grad_output[0]


    forward_handle = TARGET_LAYER.register_forward_hook(
        forward_hook
    )

    backward_handle = TARGET_LAYER.register_full_backward_hook(
        backward_hook
    )

    try:

        # ----------------------------------------------------
        # Forward pass
        # ----------------------------------------------------

        model.zero_grad()

        outputs = model(
            input_tensor
        )

        # ----------------------------------------------------
        # Select predicted class
        # ----------------------------------------------------

        target_score = outputs[
            0,
            target_class
        ]

        # ----------------------------------------------------
        # Backward pass
        # ----------------------------------------------------

        target_score.backward()

        if activations is None or gradients is None:

            raise RuntimeError(
                "Grad-CAM hooks did not capture model features."
            )

        # ----------------------------------------------------
        # Global average pooling of gradients
        # ----------------------------------------------------

        weights = gradients.mean(
            dim=(2, 3),
            keepdim=True
        )

        # ----------------------------------------------------
        # Weighted feature maps
        # ----------------------------------------------------

        cam = (
            weights * activations
        ).sum(
            dim=1,
            keepdim=True
        )

        # ----------------------------------------------------
        # ReLU
        # ----------------------------------------------------

        cam = F.relu(cam)

        # ----------------------------------------------------
        # Resize to image size
        # ----------------------------------------------------

        cam = F.interpolate(
            cam,
            size=(224, 224),
            mode="bilinear",
            align_corners=False
        )

        cam = cam.squeeze()

        # ----------------------------------------------------
        # Normalize
        # ----------------------------------------------------

        cam_min = cam.min()
        cam_max = cam.max()

        if (cam_max - cam_min) > 1e-8:

            cam = (
                cam - cam_min
            ) / (
                cam_max - cam_min
            )

        else:

            cam = torch.zeros_like(
                cam
            )

        return cam.detach()

    finally:

        forward_handle.remove()
        backward_handle.remove()


# ============================================================
# GRAD-CAM OVERLAY
# ============================================================

def create_gradcam_overlay(
    original_image,
    heatmap
):
    """
    Creates a visual Grad-CAM overlay.

    Returns:
        Base64 encoded JPEG image.
    """

    # --------------------------------------------------------
    # Resize original image
    # --------------------------------------------------------

    image = original_image.resize(
        (224, 224)
    ).convert("RGB")


    # --------------------------------------------------------
    # Convert heatmap to PIL
    # --------------------------------------------------------

    heatmap_array = (
        heatmap
        .cpu()
        .numpy()
        * 255
    ).astype("uint8")

    heatmap_image = Image.fromarray(
        heatmap_array,
        mode="L"
    )


    # --------------------------------------------------------
    # Apply heatmap color map
    # --------------------------------------------------------

    # Create a simple red/yellow highlight without
    # requiring OpenCV or matplotlib.

    heatmap_rgb = Image.new(
        "RGB",
        heatmap_image.size
    )

    pixels = heatmap_image.load()
    output_pixels = heatmap_rgb.load()

    for y in range(
        heatmap_image.height
    ):

        for x in range(
            heatmap_image.width
        ):

            value = pixels[x, y] / 255.0

            red = int(
                min(
                    255,
                    value * 2.0 * 255
                )
            )

            green = int(
                min(
                    255,
                    max(
                        0,
                        (value - 0.5)
                        * 2.0
                        * 255
                    )
                )
            )

            blue = int(
                max(
                    0,
                    (0.35 - value)
                    * 255
                )
            )

            output_pixels[x, y] = (
                red,
                green,
                blue
            )


    # --------------------------------------------------------
    # Blend original image and heatmap
    # --------------------------------------------------------

    overlay = Image.blend(
        image,
        heatmap_rgb,
        alpha=0.45
    )


    # --------------------------------------------------------
    # Encode as base64
    # --------------------------------------------------------

    buffer = io.BytesIO()

    overlay.save(
        buffer,
        format="JPEG",
        quality=88
    )

    encoded = base64.b64encode(
        buffer.getvalue()
    ).decode("utf-8")


    return encoded


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_image(image_path):

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    image = Image.open(
        image_path
    ).convert("RGB")


    # --------------------------------------------------------
    # Preprocess
    # --------------------------------------------------------

    input_tensor = transform(
        image
    ).unsqueeze(0)

    input_tensor = input_tensor.to(
        DEVICE
    )


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    with torch.no_grad():

        outputs = model(
            input_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted = torch.max(
            probabilities,
            dim=1
        )


    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    predicted_index = predicted.item()

    category = CLASS_NAMES[
        predicted_index
    ]

    confidence_percentage = (
        confidence.item() * 100
    )


    # --------------------------------------------------------
    # Grad-CAM
    # --------------------------------------------------------

    try:

        heatmap = generate_gradcam(
            input_tensor,
            predicted_index
        )

        gradcam_image = create_gradcam_overlay(
            image,
            heatmap
        )

        gradcam_available = True

    except Exception as error:

        print(
            f"Grad-CAM generation failed: {error}"
        )

        gradcam_image = None

        gradcam_available = False


    # --------------------------------------------------------
    # Confidence handling
    # --------------------------------------------------------

    if confidence_percentage < CONFIDENCE_THRESHOLD:

        confidence_status = "Low Confidence"

        review_required = True

        recommended_bin = "Manual Verification"

        disposal_guidance = (
            "The AI is not sufficiently confident "
            "about this classification. Verify the "
            "waste type before disposal."
        )

        hazardous_warning = True

    else:

        confidence_status = "High Confidence"

        review_required = False

        guidance = DISPOSAL_GUIDANCE[
            category
        ]

        recommended_bin = guidance[
            "bin"
        ]

        disposal_guidance = guidance[
            "guidance"
        ]

        hazardous_warning = guidance[
            "warning"
        ]


    # --------------------------------------------------------
    # Explanation
    # --------------------------------------------------------

    explanation = EXPLANATIONS.get(
        category,
        (
            "The AI classified this item based on "
            "visual patterns detected in the image."
        )
    )


    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {

        "category": category,

        "confidence": round(
            confidence_percentage,
            2
        ),

        "confidence_status":
            confidence_status,

        "review_required":
            review_required,

        "recommended_bin":
            recommended_bin,

        "disposal_guidance":
            disposal_guidance,

        "hazardous_warning":
            hazardous_warning,

        "explanation":
            explanation,

        "gradcam_available":
            gradcam_available,

        "gradcam_image":
            gradcam_image
    }