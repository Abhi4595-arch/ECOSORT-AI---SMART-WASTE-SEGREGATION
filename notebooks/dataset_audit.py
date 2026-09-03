from pathlib import Path
from collections import Counter

# Project root is one level above the notebooks folder
DATASET_DIR = Path(__file__).resolve().parent.parent / "dataset"

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

category_counts = Counter()
class_counts = Counter()
extension_counts = Counter()

for image_path in DATASET_DIR.rglob("*"):

    if not image_path.is_file():
        continue

    if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
        continue

    relative_parts = image_path.relative_to(DATASET_DIR).parts

    # Expected:
    # Category / Class / image.jpg
    if len(relative_parts) >= 3:

        category = relative_parts[0]
        waste_class = relative_parts[1]

        category_counts[category] += 1
        class_counts[waste_class] += 1
        extension_counts[image_path.suffix.lower()] += 1


print("\n" + "=" * 50)
print("ECO-SORT AI — DATASET AUDIT")
print("=" * 50)

print("\nDATASET LOCATION:")
print(DATASET_DIR)

print("\n" + "-" * 50)
print("TOP-LEVEL CATEGORY COUNTS")
print("-" * 50)

for category, count in sorted(category_counts.items()):
    print(f"{category:<20} {count}")

print("\n" + "-" * 50)
print("WASTE CLASS COUNTS")
print("-" * 50)

for waste_class, count in sorted(class_counts.items()):
    print(f"{waste_class:<30} {count}")

print("\n" + "-" * 50)
print("IMAGE FORMAT COUNTS")
print("-" * 50)

for extension, count in sorted(extension_counts.items()):
    print(f"{extension:<10} {count}")

print("\n" + "=" * 50)
print("TOTAL IMAGES:", sum(category_counts.values()))
print("=" * 50)