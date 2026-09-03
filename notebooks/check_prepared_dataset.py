from pathlib import Path
from collections import Counter

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATASET_DIR = PROJECT_ROOT / "prepared_dataset"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

SPLITS = ["train", "val", "test"]


def count_images(folder):
    return sum(
        1
        for path in folder.rglob("*")
        if path.is_file()
        and path.suffix.lower() in IMAGE_EXTENSIONS
    )


print("=" * 65)
print("ECO-SORT AI — PREPARED DATASET CHECK")
print("=" * 65)

print(f"\nDataset location:")
print(DATASET_DIR)

grand_total = 0


for split in SPLITS:

    split_dir = DATASET_DIR / split

    print("\n" + "-" * 65)
    print(f"{split.upper()} DATASET")
    print("-" * 65)

    split_total = 0

    for category_dir in sorted(split_dir.iterdir()):

        if not category_dir.is_dir():
            continue

        category_total = 0

        print(f"\n{category_dir.name}")

        for class_dir in sorted(category_dir.iterdir()):

            if not class_dir.is_dir():
                continue

            count = count_images(class_dir)

            category_total += count
            split_total += count

            print(
                f"  {class_dir.name:<25} {count:>4}"
            )

        print(
            f"  {'CATEGORY TOTAL':<25} {category_total:>4}"
        )

    print(
        f"\n{split.upper()} TOTAL: {split_total}"
    )

    grand_total += split_total


print("\n" + "=" * 65)
print(f"TOTAL PREPARED IMAGES: {grand_total}")
print("=" * 65)