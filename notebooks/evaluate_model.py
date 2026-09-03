import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from torchvision.models import MobileNet_V3_Small_Weights
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np


# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEST_DIR = os.path.join(BASE_DIR, "prepared_dataset", "test")
MODEL_PATH = os.path.join(BASE_DIR, "model", "eco_sort_mobilenet.pth")

IMAGE_SIZE = 224
BATCH_SIZE = 32

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# TRANSFORM
# ============================================================

test_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# ============================================================
# LOAD TEST DATA
# ============================================================

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=test_transform
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# ============================================================
# LOAD CHECKPOINT
# ============================================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

class_names = checkpoint["class_names"]

print("=" * 60)
print("ECO-SORT AI - MODEL EVALUATION")
print("=" * 60)

print(f"Device: {DEVICE}")
print(f"Test images: {len(test_dataset)}")
print(f"Classes: {len(class_names)}")

print("\nClasses:")

for i, name in enumerate(class_names):
    print(f"{i:2d}: {name}")


# ============================================================
# CREATE MODEL
# ============================================================

model = models.mobilenet_v3_small(
    weights=None
)

in_features = model.classifier[-1].in_features

model.classifier[-1] = nn.Linear(
    in_features,
    len(class_names)
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(DEVICE)
model.eval()


# ============================================================
# PREDICTIONS
# ============================================================

all_predictions = []
all_labels = []

correct = 0
total = 0

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        probabilities = torch.softmax(outputs, dim=1)

        _, predictions = torch.max(
            probabilities,
            1
        )

        total += labels.size(0)

        correct += (
            predictions == labels
        ).sum().item()

        all_predictions.extend(
            predictions.cpu().numpy()
        )

        all_labels.extend(
            labels.cpu().numpy()
        )


# ============================================================
# ACCURACY
# ============================================================

accuracy = correct / total

print("\n" + "=" * 60)
print("TEST RESULT")
print("=" * 60)

print(
    f"Test Accuracy: {accuracy * 100:.2f}%"
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=class_names,
        digits=4,
        zero_division=0
    )
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    all_labels,
    all_predictions
)

print("\n" + "=" * 60)
print("CONFUSION MATRIX")
print("=" * 60)

print(cm)


# ============================================================
# SAVE RESULTS
# ============================================================

results_path = os.path.join(
    BASE_DIR,
    "model",
    "evaluation_results.txt"
)

with open(results_path, "w") as f:

    f.write("ECO-SORT AI MODEL EVALUATION\n")
    f.write("=" * 60 + "\n\n")

    f.write(
        f"Test Accuracy: {accuracy * 100:.2f}%\n\n"
    )

    f.write("Classification Report\n")
    f.write("-" * 60 + "\n")

    f.write(
        classification_report(
            all_labels,
            all_predictions,
            target_names=class_names,
            digits=4,
            zero_division=0
        )
    )

    f.write("\nConfusion Matrix\n")
    f.write("-" * 60 + "\n")

    f.write(str(cm))


print("\nResults saved to:")

print(results_path)