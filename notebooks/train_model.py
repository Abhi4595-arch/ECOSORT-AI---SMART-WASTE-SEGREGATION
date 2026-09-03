import os
import copy
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import MobileNet_V3_Small_Weights
from collections import Counter


# ============================================================
# 1. CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TRAIN_DIR = os.path.join(BASE_DIR, "prepared_dataset", "train")
VAL_DIR = os.path.join(BASE_DIR, "prepared_dataset", "val")

MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "eco_sort_mobilenet.pth")

IMAGE_SIZE = 224
BATCH_SIZE = 32
NUM_EPOCHS = 10
LEARNING_RATE = 0.0001

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("=" * 60)
print("ECO-SORT AI - MODEL TRAINING")
print("=" * 60)

print(f"Device: {DEVICE}")
print(f"Train directory: {TRAIN_DIR}")
print(f"Validation directory: {VAL_DIR}")


# ============================================================
# 2. IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# 3. LOAD DATASET
# ============================================================

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transform
)

print("\nClasses:")
for index, class_name in enumerate(train_dataset.classes):
    print(f"{index:2d}: {class_name}")

print(f"\nNumber of classes: {len(train_dataset.classes)}")
print(f"Training images: {len(train_dataset)}")
print(f"Validation images: {len(val_dataset)}")


# ============================================================
# 4. DATA LOADERS
# ============================================================

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# 5. CALCULATE CLASS WEIGHTS
# ============================================================

class_counts = Counter(train_dataset.targets)

total_samples = len(train_dataset)
num_classes = len(train_dataset.classes)

class_weights = []

for class_index in range(num_classes):
    count = class_counts[class_index]

    weight = total_samples / (num_classes * count)

    class_weights.append(weight)

class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(DEVICE)

print("\nClass weights:")

for i, class_name in enumerate(train_dataset.classes):
    print(
        f"{class_name:35s} "
        f"count={class_counts[i]:4d} "
        f"weight={class_weights[i]:.3f}"
    )


# ============================================================
# 6. LOAD PRETRAINED MOBILENETV3
# ============================================================

print("\nLoading MobileNetV3-Small...")

weights = MobileNet_V3_Small_Weights.DEFAULT

model = models.mobilenet_v3_small(
    weights=weights
)


# ============================================================
# 7. REPLACE CLASSIFIER
# ============================================================

in_features = model.classifier[-1].in_features

model.classifier[-1] = nn.Linear(
    in_features,
    num_classes
)

model = model.to(DEVICE)


# ============================================================
# 8. LOSS + OPTIMIZER
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)


# ============================================================
# 9. TRAINING
# ============================================================

best_val_accuracy = 0.0
best_model_state = copy.deepcopy(model.state_dict())

print("\n" + "=" * 60)
print("STARTING TRAINING")
print("=" * 60)

for epoch in range(NUM_EPOCHS):

    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item() * images.size(0)

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)

        correct += (predicted == labels).sum().item()

    train_loss = running_loss / total
    train_accuracy = correct / total


    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    model.eval()

    val_loss_total = 0.0
    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            outputs = model(images)

            loss = criterion(outputs, labels)

            val_loss_total += loss.item() * images.size(0)

            _, predicted = torch.max(outputs, 1)

            val_total += labels.size(0)

            val_correct += (predicted == labels).sum().item()

    val_loss = val_loss_total / val_total
    val_accuracy = val_correct / val_total


    # --------------------------------------------------------
    # PRINT RESULTS
    # --------------------------------------------------------

    print(
        f"\nEpoch [{epoch + 1}/{NUM_EPOCHS}]"
    )

    print(
        f"Train Loss: {train_loss:.4f} | "
        f"Train Accuracy: {train_accuracy * 100:.2f}%"
    )

    print(
        f"Val Loss:   {val_loss:.4f} | "
        f"Val Accuracy: {val_accuracy * 100:.2f}%"
    )


    # --------------------------------------------------------
    # SAVE BEST MODEL
    # --------------------------------------------------------

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = val_accuracy

        best_model_state = copy.deepcopy(
            model.state_dict()
        )

        print("✓ New best model!")


# ============================================================
# 10. RESTORE BEST MODEL
# ============================================================

model.load_state_dict(best_model_state)


# ============================================================
# 11. CATEGORY MAPPING
# ============================================================

category_mapping = {

    "Hazardous": [
        "Hazardous/batteries",
        "Hazardous/e-waste",
        "Hazardous/paints",
        "Hazardous/pesticides"
    ],

    "Organic": [
        "Organic/coffee_tea_bags",
        "Organic/egg_shells",
        "Organic/food_scraps",
        "Organic/kitchen_waste",
        "Organic/yard_trimmings"
    ],

    "Recyclable": [
        "Recyclable/cans_all_type",
        "Recyclable/glass_containers",
        "Recyclable/paper_products",
        "Recyclable/plastic_bottles"
    ]
}


# ============================================================
# 12. SAVE MODEL
# ============================================================

checkpoint = {

    "model_state_dict": model.state_dict(),

    "class_names": train_dataset.classes,

    "category_mapping": category_mapping,

    "image_size": IMAGE_SIZE,

    "model_name": "MobileNetV3-Small",

    "best_val_accuracy": best_val_accuracy
}


torch.save(
    checkpoint,
    MODEL_PATH
)


# ============================================================
# 13. FINAL OUTPUT
# ============================================================

print("\n" + "=" * 60)
print("TRAINING COMPLETE")
print("=" * 60)

print(
    f"Best Validation Accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

print(f"\nModel saved to:")

print(MODEL_PATH)

print("\nOfficial categories:")

print("1. Hazardous")
print("2. Organic")
print("3. Recyclable")

print("\n13-class → 3-category architecture ready.")