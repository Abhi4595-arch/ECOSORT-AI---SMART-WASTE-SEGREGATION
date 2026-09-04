import os
import copy
import json
import random

import numpy as np
import torch
import torch.nn as nn

from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import MobileNet_V3_Small_Weights

from collections import Counter
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
)


# ============================================================
# 1. CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

TRAIN_DIR = os.path.join(
    BASE_DIR,
    "prepared_dataset",
    "train"
)

VAL_DIR = os.path.join(
    BASE_DIR,
    "prepared_dataset",
    "val"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "model"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "eco_sort_mobilenet.pth"
)

HISTORY_PATH = os.path.join(
    MODEL_DIR,
    "training_history.json"
)

IMAGE_SIZE = 224
BATCH_SIZE = 32

NUM_EPOCHS = 20

LEARNING_RATE = 0.0001

WEIGHT_DECAY = 0.0001

PATIENCE = 5

SEED = 42

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# 2. REPRODUCIBILITY
# ============================================================

random.seed(SEED)

np.random.seed(SEED)

torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

# Deterministic behavior where possible.
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False


# ============================================================
# 3. HEADER
# ============================================================

print("=" * 70)
print("ECO-SORT AI - MODEL TRAINING")
print("=" * 70)

print(f"Device:            {DEVICE}")
print(f"Train directory:   {TRAIN_DIR}")
print(f"Validation dir:    {VAL_DIR}")
print(f"Image size:        {IMAGE_SIZE}")
print(f"Batch size:        {BATCH_SIZE}")
print(f"Maximum epochs:    {NUM_EPOCHS}")
print(f"Learning rate:     {LEARNING_RATE}")
print(f"Weight decay:      {WEIGHT_DECAY}")
print(f"Early stopping:    {PATIENCE} epochs")
print(f"Random seed:       {SEED}")


# ============================================================
# 4. VALIDATE DATASET PATHS
# ============================================================

if not os.path.isdir(TRAIN_DIR):

    raise FileNotFoundError(
        f"\nTraining dataset not found:\n{TRAIN_DIR}"
    )

if not os.path.isdir(VAL_DIR):

    raise FileNotFoundError(
        f"\nValidation dataset not found:\n{VAL_DIR}"
    )


# ============================================================
# 5. IMAGE TRANSFORMS
# ============================================================

train_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.RandomHorizontalFlip(
        p=0.5
    ),

    transforms.RandomRotation(
        degrees=15
    ),

    transforms.ColorJitter(
        brightness=0.2,
        contrast=0.2,
        saturation=0.2
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


val_transform = transforms.Compose([

    transforms.Resize(
        (IMAGE_SIZE, IMAGE_SIZE)
    ),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# ============================================================
# 6. LOAD DATASETS
# ============================================================

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transform
)


# ============================================================
# 7. VALIDATE CLASS STRUCTURE
# ============================================================

train_classes = train_dataset.classes

val_classes = val_dataset.classes

if train_classes != val_classes:

    raise ValueError(
        "\nTraining and validation class orders do not match!\n\n"
        f"Training classes:   {train_classes}\n"
        f"Validation classes: {val_classes}\n"
    )

num_classes = len(
    train_classes
)


# ============================================================
# 8. DATASET INFORMATION
# ============================================================

print("\nClasses:")

for index, class_name in enumerate(
    train_classes
):

    print(
        f"{index:2d}: {class_name}"
    )

print(
    f"\nNumber of classes: {num_classes}"
)

print(
    f"Training images:   {len(train_dataset)}"
)

print(
    f"Validation images: {len(val_dataset)}"
)


# ============================================================
# 9. DATA LOADERS
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
# 10. CALCULATE CLASS WEIGHTS
# ============================================================

class_counts = Counter(
    train_dataset.targets
)

total_samples = len(
    train_dataset
)

class_weights = []

for class_index in range(
    num_classes
):

    count = class_counts[
        class_index
    ]

    if count == 0:

        raise ValueError(
            f"Class {class_index} has zero training images."
        )

    weight = (
        total_samples
        /
        (
            num_classes
            *
            count
        )
    )

    class_weights.append(
        weight
    )


class_weights = torch.tensor(
    class_weights,
    dtype=torch.float32
).to(DEVICE)


print("\nClass weights:")

for i, class_name in enumerate(
    train_classes
):

    print(
        f"{class_name:35s} "
        f"count={class_counts[i]:4d} "
        f"weight={class_weights[i]:.3f}"
    )


# ============================================================
# 11. LOAD PRETRAINED MOBILENETV3-SMALL
# ============================================================

print(
    "\nLoading pretrained MobileNetV3-Small..."
)

weights = (
    MobileNet_V3_Small_Weights.DEFAULT
)

model = models.mobilenet_v3_small(
    weights=weights
)


# ============================================================
# 12. REPLACE CLASSIFIER
# ============================================================

in_features = (
    model.classifier[-1].in_features
)

model.classifier[-1] = nn.Linear(
    in_features,
    num_classes
)

model = model.to(
    DEVICE
)


# ============================================================
# 13. LOSS FUNCTION
# ============================================================

criterion = nn.CrossEntropyLoss(
    weight=class_weights
)


# ============================================================
# 14. OPTIMIZER
# ============================================================

optimizer = torch.optim.AdamW(
    model.parameters(),
    lr=LEARNING_RATE,
    weight_decay=WEIGHT_DECAY
)


# ============================================================
# 15. LEARNING-RATE SCHEDULER
# ============================================================

scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer,
    mode="max",
    factor=0.5,
    patience=2
)


# ============================================================
# 16. TRAINING STATE
# ============================================================

best_val_f1 = -1.0

best_val_accuracy = 0.0

best_epoch = 0

best_model_state = copy.deepcopy(
    model.state_dict()
)

epochs_without_improvement = 0


training_history = {
    "epochs": [],
    "train_loss": [],
    "train_accuracy": [],
    "val_loss": [],
    "val_accuracy": [],
    "val_macro_precision": [],
    "val_macro_recall": [],
    "val_macro_f1": [],
    "learning_rate": []
}


# ============================================================
# 17. TRAINING
# ============================================================

print("\n" + "=" * 70)
print("STARTING TRAINING")
print("=" * 70)


for epoch in range(
    NUM_EPOCHS
):

    # --------------------------------------------------------
    # TRAINING PHASE
    # --------------------------------------------------------

    model.train()

    running_loss = 0.0

    train_correct = 0

    train_total = 0


    for images, labels in train_loader:

        images = images.to(
            DEVICE
        )

        labels = labels.to(
            DEVICE
        )

        optimizer.zero_grad()

        outputs = model(
            images
        )

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item()
            *
            images.size(0)
        )

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        train_total += (
            labels.size(0)
        )

        train_correct += (
            predictions == labels
        ).sum().item()


    train_loss = (
        running_loss
        /
        train_total
    )

    train_accuracy = (
        train_correct
        /
        train_total
    )


    # --------------------------------------------------------
    # VALIDATION PHASE
    # --------------------------------------------------------

    model.eval()

    val_loss_total = 0.0

    val_correct = 0

    val_total = 0

    val_predictions = []

    val_labels = []


    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(
                DEVICE
            )

            labels = labels.to(
                DEVICE
            )

            outputs = model(
                images
            )

            loss = criterion(
                outputs,
                labels
            )

            val_loss_total += (
                loss.item()
                *
                images.size(0)
            )

            predictions = torch.argmax(
                outputs,
                dim=1
            )

            val_total += (
                labels.size(0)
            )

            val_correct += (
                predictions == labels
            ).sum().item()

            val_predictions.extend(
                predictions.cpu().numpy()
            )

            val_labels.extend(
                labels.cpu().numpy()
            )


    val_loss = (
        val_loss_total
        /
        val_total
    )

    val_accuracy = (
        val_correct
        /
        val_total
    )


    # --------------------------------------------------------
    # VALIDATION METRICS
    # --------------------------------------------------------

    macro_precision, macro_recall, macro_f1, _ = (
        precision_recall_fscore_support(
            val_labels,
            val_predictions,
            average="macro",
            zero_division=0
        )
    )


    # --------------------------------------------------------
    # LEARNING RATE
    # --------------------------------------------------------

    current_lr = optimizer.param_groups[0][
        "lr"
    ]

    scheduler.step(
        macro_f1
    )


    # --------------------------------------------------------
    # SAVE HISTORY
    # --------------------------------------------------------

    training_history["epochs"].append(
        epoch + 1
    )

    training_history["train_loss"].append(
        float(train_loss)
    )

    training_history["train_accuracy"].append(
        float(train_accuracy)
    )

    training_history["val_loss"].append(
        float(val_loss)
    )

    training_history["val_accuracy"].append(
        float(val_accuracy)
    )

    training_history["val_macro_precision"].append(
        float(macro_precision)
    )

    training_history["val_macro_recall"].append(
        float(macro_recall)
    )

    training_history["val_macro_f1"].append(
        float(macro_f1)
    )

    training_history["learning_rate"].append(
        float(current_lr)
    )


    # --------------------------------------------------------
    # PRINT RESULTS
    # --------------------------------------------------------

    print(
        f"\nEpoch [{epoch + 1}/{NUM_EPOCHS}]"
    )

    print(
        f"Train Loss:       {train_loss:.4f}"
    )

    print(
        f"Train Accuracy:   "
        f"{train_accuracy * 100:.2f}%"
    )

    print(
        f"Val Loss:         {val_loss:.4f}"
    )

    print(
        f"Val Accuracy:     "
        f"{val_accuracy * 100:.2f}%"
    )

    print(
        f"Val Macro F1:     "
        f"{macro_f1 * 100:.2f}%"
    )

    print(
        f"Learning Rate:    "
        f"{current_lr:.7f}"
    )


    # --------------------------------------------------------
    # BEST MODEL
    # --------------------------------------------------------

    if macro_f1 > best_val_f1:

        best_val_f1 = macro_f1

        best_val_accuracy = val_accuracy

        best_epoch = epoch + 1

        best_model_state = copy.deepcopy(
            model.state_dict()
        )

        epochs_without_improvement = 0

        print(
            "✓ New best model!"
        )

    else:

        epochs_without_improvement += 1

        print(
            f"No improvement "
            f"({epochs_without_improvement}/"
            f"{PATIENCE})"
        )


    # --------------------------------------------------------
    # EARLY STOPPING
    # --------------------------------------------------------

    if (
        epochs_without_improvement
        >= PATIENCE
    ):

        print(
            "\nEarly stopping triggered."
        )

        break


# ============================================================
# 18. RESTORE BEST MODEL
# ============================================================

model.load_state_dict(
    best_model_state
)


# ============================================================
# 19. CATEGORY MAPPING
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
# 20. SAVE MODEL CHECKPOINT
# ============================================================

checkpoint = {

    "model_state_dict": model.state_dict(),

    "class_names": train_classes,

    "category_mapping": category_mapping,

    "image_size": IMAGE_SIZE,

    "model_name": "MobileNetV3-Small",

    "best_val_accuracy": best_val_accuracy,

    "best_val_macro_f1": best_val_f1,

    "best_epoch": best_epoch,

    "training_epochs": len(
        training_history["epochs"]
    ),

    "seed": SEED
}


torch.save(
    checkpoint,
    MODEL_PATH
)


# ============================================================
# 21. SAVE TRAINING HISTORY
# ============================================================

with open(
    HISTORY_PATH,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        training_history,
        f,
        indent=4
    )


# ============================================================
# 22. FINAL OUTPUT
# ============================================================

print("\n" + "=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print(
    f"Best Epoch:               {best_epoch}"
)

print(
    f"Best Validation Accuracy: "
    f"{best_val_accuracy * 100:.2f}%"
)

print(
    f"Best Validation Macro F1: "
    f"{best_val_f1 * 100:.2f}%"
)

print(
    f"\nModel saved to:"
)

print(
    MODEL_PATH
)

print(
    f"\nTraining history saved to:"
)

print(
    HISTORY_PATH
)

print("\nOfficial categories:")

print("1. Hazardous")
print("2. Organic")
print("3. Recyclable")

print(
    "\n13-class → 3-category architecture ready."
)