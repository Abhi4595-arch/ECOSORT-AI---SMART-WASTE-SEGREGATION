from pathlib import Path
from PIL import Image
import random
import shutil

# ============================================================
# ECO-SORT AI — DATASET PREPARATION
# ============================================================

# Project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Original dataset — NEVER modify this
SOURCE_DIR = PROJECT_ROOT / "dataset"

# New prepared dataset
OUTPUT_DIR = PROJECT_ROOT / "prepared_dataset"

# Reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# Supported image formats
IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

# ============================================================
# SELECTED 13 CLASSES
# ============================================================

SELECTED_CLASSES = {
    "Hazardous": [
        "batteries",
        "e-waste",
        "paints",
        "pesticides"
    ],

    "Organic": [
        "coffee_tea_bags",
        "egg_shells",
        "food_scraps",
        "kitchen_waste",
        "yard_trimmings"
    ],

    "Recyclable": [
        "cans_all_type",
        "glass_containers",
        "paper_products",
        "plastic_bottles"
    ]
}

# ============================================================
# SPLIT RATIOS
# ============================================================

TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15

# ============================================================
# VALIDATE IMAGE
# ============================================================

def is_valid_image(image_path):
    try:
        with Image.open(image_path) as img:
            img.verify()

        # Open again because verify() invalidates the image object
        with Image.open(image_path) as img:
            img.load()

        return True

    except Exception:
        return False


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 60)
    print("ECO-SORT AI — DATASET PREPARATION")
    print("=" * 60)

    print(f"\nSource dataset:")
    print(SOURCE_DIR)

    print(f"\nOutput dataset:")
    print(OUTPUT_DIR)

    # Create output folders
    for split in ["train", "val", "test"]:
        for category, classes in SELECTED_CLASSES.items():
            for class_name in classes:
                output_class_dir = (
                    OUTPUT_DIR
                    / split
                    / category
                    / class_name
                )

                output_class_dir.mkdir(
                    parents=True,
                    exist_ok=True
                )

    total_found = 0
    total_valid = 0
    total_invalid = 0

    # ========================================================
    # PROCESS EACH CLASS
    # ========================================================

    for category, classes in SELECTED_CLASSES.items():

        print("\n" + "-" * 60)
        print(f"CATEGORY: {category}")
        print("-" * 60)

        for class_name in classes:

            source_class_dir = (
                SOURCE_DIR
                / category
                / class_name
            )

            if not source_class_dir.exists():
                print(
                    f"\nWARNING: Missing folder: "
                    f"{source_class_dir}"
                )
                continue

            # Find images
            images = [
                p for p in source_class_dir.rglob("*")
                if p.is_file()
                and p.suffix.lower() in IMAGE_EXTENSIONS
            ]

            total_found += len(images)

            valid_images = []

            # Validate
            for image_path in images:

                if is_valid_image(image_path):
                    valid_images.append(image_path)

                else:
                    total_invalid += 1
                    print(
                        f"INVALID IMAGE: {image_path}"
                    )

            total_valid += len(valid_images)

            # Shuffle
            random.shuffle(valid_images)

            # Calculate split sizes
            total = len(valid_images)

            train_end = int(total * TRAIN_RATIO)
            val_end = train_end + int(total * VAL_RATIO)

            train_images = valid_images[:train_end]
            val_images = valid_images[train_end:val_end]
            test_images = valid_images[val_end:]

            # Destination directories
            train_dir = (
                OUTPUT_DIR
                / "train"
                / category
                / class_name
            )

            val_dir = (
                OUTPUT_DIR
                / "val"
                / category
                / class_name
            )

            test_dir = (
                OUTPUT_DIR
                / "test"
                / category
                / class_name
            )

            # Copy images
            for image in train_images:
                shutil.copy2(
                    image,
                    train_dir / image.name
                )

            for image in val_images:
                shutil.copy2(
                    image,
                    val_dir / image.name
                )

            for image in test_images:
                shutil.copy2(
                    image,
                    test_dir / image.name
                )

            print(
                f"{class_name:<25} "
                f"Total: {total:<4} | "
                f"Train: {len(train_images):<4} | "
                f"Val: {len(val_images):<4} | "
                f"Test: {len(test_images):<4}"
            )

    # ========================================================
    # SUMMARY
    # ========================================================

    print("\n" + "=" * 60)
    print("DATASET PREPARATION COMPLETE")
    print("=" * 60)

    print(f"\nImages found:    {total_found}")
    print(f"Valid images:    {total_valid}")
    print(f"Invalid images:  {total_invalid}")

    print(f"\nPrepared dataset:")
    print(OUTPUT_DIR)

    print("\nOriginal dataset was NOT modified.")

    print("\nNext structure:")
    print("""
prepared_dataset/
├── train/
│   ├── Hazardous/
│   ├── Organic/
│   └── Recyclable/
│
├── val/
│   ├── Hazardous/
│   ├── Organic/
│   └── Recyclable/
│
└── test/
    ├── Hazardous/
    ├── Organic/
    └── Recyclable/
""")

    print("=" * 60)


if __name__ == "__main__":
    main()