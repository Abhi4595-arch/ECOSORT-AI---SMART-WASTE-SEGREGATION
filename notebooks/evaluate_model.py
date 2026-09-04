import os
import json
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_recall_fscore_support,
)

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

TEST_DIR = os.path.join(
    BASE_DIR,
    "prepared_dataset",
    "test"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "model",
    "eco_sort_mobilenet.pth"
)

RESULTS_DIR = os.path.join(
    BASE_DIR,
    "model"
)

IMAGE_SIZE = 224
BATCH_SIZE = 32

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ============================================================
# VALIDATE PATHS
# ============================================================

if not os.path.exists(TEST_DIR):
    raise FileNotFoundError(
        f"Test dataset not found:\n{TEST_DIR}"
    )

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"Model checkpoint not found:\n{MODEL_PATH}"
    )


# ============================================================
# TEST TRANSFORM
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
# LOAD TEST DATASET
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

if "model_state_dict" not in checkpoint:
    raise KeyError(
        "Checkpoint does not contain 'model_state_dict'."
    )

if "class_names" not in checkpoint:
    raise KeyError(
        "Checkpoint does not contain 'class_names'."
    )

class_names = checkpoint["class_names"]

dataset_classes = test_dataset.classes


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("ECO-SORT AI - MODEL EVALUATION")
print("=" * 70)

print(f"Device:       {DEVICE}")
print(f"Test images:  {len(test_dataset)}")
print(f"Model:        {MODEL_PATH}")
print(f"Test dataset: {TEST_DIR}")
print(f"Classes:      {len(class_names)}")


# ============================================================
# CLASS INFORMATION
# ============================================================

print("\nCheckpoint class order:")

for i, name in enumerate(class_names):
    print(f"  {i}: {name}")

print("\nTest dataset class order:")

for i, name in enumerate(dataset_classes):
    print(f"  {i}: {name}")


# ============================================================
# IMPORTANT CLASS-ORDER VALIDATION
# ============================================================

if len(class_names) != len(dataset_classes):
    raise ValueError(
        "\nClass-count mismatch!\n"
        f"Model classes: {len(class_names)}\n"
        f"Dataset classes: {len(dataset_classes)}\n"
        "Evaluation cannot continue safely."
    )

if list(class_names) != list(dataset_classes):
    raise ValueError(
        "\nClass-order mismatch detected!\n\n"
        f"Checkpoint classes: {class_names}\n"
        f"Dataset classes:    {dataset_classes}\n\n"
        "The model and test dataset must use the same class order "
        "before evaluation. Check train_model.py."
    )

print("\nClass mapping: VERIFIED")


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

total = 0
correct = 0

with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        outputs = model(images)

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        predictions = torch.argmax(
            probabilities,
            dim=1
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
# OVERALL METRICS
# ============================================================

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

macro_precision, macro_recall, macro_f1, _ = (
    precision_recall_fscore_support(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0
    )
)

weighted_precision, weighted_recall, weighted_f1, _ = (
    precision_recall_fscore_support(
        all_labels,
        all_predictions,
        average="weighted",
        zero_division=0
    )
)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

report_dict = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(len(class_names))),
    target_names=class_names,
    digits=4,
    zero_division=0,
    output_dict=True
)

report_text = classification_report(
    all_labels,
    all_predictions,
    labels=list(range(len(class_names))),
    target_names=class_names,
    digits=4,
    zero_division=0
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=list(range(len(class_names)))
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n" + "=" * 70)
print("TEST RESULTS")
print("=" * 70)

print(f"Total test images:       {total}")
print(f"Correct predictions:     {correct}")
print(f"Incorrect predictions:   {total - correct}")

print(f"\nAccuracy:                {accuracy * 100:.2f}%")

print("\nMacro Average:")
print(f"  Precision:             {macro_precision:.4f}")
print(f"  Recall:                {macro_recall:.4f}")
print(f"  F1-score:              {macro_f1:.4f}")

print("\nWeighted Average:")
print(f"  Precision:             {weighted_precision:.4f}")
print(f"  Recall:                {weighted_recall:.4f}")
print(f"  F1-score:              {weighted_f1:.4f}")


# ============================================================
# PER-CLASS CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("PER-CLASS CLASSIFICATION REPORT")
print("=" * 70)

print(report_text)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print("\nRows = Actual")
print("Columns = Predicted\n")

header = "Actual \\ Predicted"

print(
    f"{header:<22}",
    end=""
)

for name in class_names:
    print(
        f"{name:<16}",
        end=""
    )

print()

print("-" * (22 + 16 * len(class_names)))

for i, name in enumerate(class_names):

    print(
        f"{name:<22}",
        end=""
    )

    for value in cm[i]:
        print(
            f"{value:<16}",
            end=""
        )

    print()


# ============================================================
# SAVE TXT RESULTS
# ============================================================

os.makedirs(
    RESULTS_DIR,
    exist_ok=True
)

results_path = os.path.join(
    RESULTS_DIR,
    "evaluation_results.txt"
)

with open(
    results_path,
    "w",
    encoding="utf-8"
) as f:

    f.write("ECO-SORT AI MODEL EVALUATION\n")
    f.write("=" * 70 + "\n\n")

    f.write(f"Device: {DEVICE}\n")
    f.write(f"Test images: {total}\n")
    f.write(f"Correct predictions: {correct}\n")
    f.write(f"Incorrect predictions: {total - correct}\n\n")

    f.write("CLASS ORDER\n")
    f.write("-" * 70 + "\n")

    for i, name in enumerate(class_names):
        f.write(f"{i}: {name}\n")

    f.write("\nOVERALL METRICS\n")
    f.write("-" * 70 + "\n")

    f.write(
        f"Accuracy: {accuracy * 100:.2f}%\n"
    )

    f.write(
        f"Macro Precision: {macro_precision:.4f}\n"
    )

    f.write(
        f"Macro Recall: {macro_recall:.4f}\n"
    )

    f.write(
        f"Macro F1-score: {macro_f1:.4f}\n"
    )

    f.write(
        f"Weighted Precision: {weighted_precision:.4f}\n"
    )

    f.write(
        f"Weighted Recall: {weighted_recall:.4f}\n"
    )

    f.write(
        f"Weighted F1-score: {weighted_f1:.4f}\n"
    )

    f.write("\nCLASSIFICATION REPORT\n")
    f.write("-" * 70 + "\n")
    f.write(report_text)

    f.write("\nCONFUSION MATRIX\n")
    f.write("-" * 70 + "\n")
    f.write("Rows = Actual, Columns = Predicted\n\n")
    f.write(str(cm))


# ============================================================
# SAVE JSON RESULTS
# ============================================================

json_path = os.path.join(
    RESULTS_DIR,
    "evaluation_results.json"
)

evaluation_data = {
    "device": str(DEVICE),
    "test_images": total,
    "correct_predictions": correct,
    "incorrect_predictions": total - correct,
    "accuracy": float(accuracy),
    "accuracy_percent": float(accuracy * 100),
    "macro_precision": float(macro_precision),
    "macro_recall": float(macro_recall),
    "macro_f1": float(macro_f1),
    "weighted_precision": float(weighted_precision),
    "weighted_recall": float(weighted_recall),
    "weighted_f1": float(weighted_f1),
    "class_names": class_names,
    "classification_report": report_dict,
    "confusion_matrix": cm.tolist()
}

with open(
    json_path,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        evaluation_data,
        f,
        indent=4
    )


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("EVALUATION COMPLETE")
print("=" * 70)

print(f"\nTXT results:")
print(results_path)

print(f"\nJSON results:")
print(json_path)