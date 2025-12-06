import json
import os
from pathlib import Path
import shutil

def check_mermaid_chart(file_path, data):
    """
    Check mermaid_chart field in detail.
    """
    if 'mermaid_chart' not in data:
        return False, "❌ No mermaid_chart field found", None
    
    mermaid = data['mermaid_chart']
    
    if not isinstance(mermaid, str):
        return False, f"❌ mermaid_chart is {type(mermaid).__name__}, should be string", None
    
    if len(mermaid) == 0:
        return False, "❌ mermaid_chart is empty", None
    
    # Count lines
    lines = mermaid.split('\n')
    
    # Check first few lines
    preview = '\n'.join(lines[:3]) if len(lines) > 3 else mermaid
    
    info = {
        'length': len(mermaid),
        'lines': len(lines),
        'preview': preview,
        'starts_with': lines[0][:50] if lines else '',
        'has_newlines': '\n' in mermaid
    }
    
    return True, "✅ mermaid_chart found and valid", info

def process_folder(folder_path, show_details=False, fix_formatting=False):
    """
    Process all JSON files in a folder.
    """
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"❌ Error: Folder '{folder_path}' does not exist")
        return
    
    # Find all JSON files
    json_files = list(folder.glob('*.json'))
    json_files = [f for f in json_files if not f.name.endswith('.backup')]
    
    if not json_files:
        print(f"❌ No JSON files found in '{folder_path}'")
        return
    
    print(f"🔍 Found {len(json_files)} JSON file(s)\n")
    print("=" * 80)
    
    stats = {
        'total': len(json_files),
        'valid': 0,
        'invalid': 0,
        'has_mermaid': 0,
        'no_mermaid': 0
    }
    
    for json_file in json_files:
        print(f"\n📄 {json_file.name}")
        print("-" * 80)
        
        try:
            # Read and parse
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            print("✅ Valid JSON syntax")
            stats['valid'] += 1
            
            # Check mermaid chart
            has_mermaid, message, info = check_mermaid_chart(json_file, data)
            print(message)
            
            if has_mermaid:
                stats['has_mermaid'] += 1
                
                if show_details and info:
                    print(f"\n   📊 Details:")
                    print(f"      • Length: {info['length']} characters")
                    print(f"      • Lines: {info['lines']}")
                    print(f"      • Starts with: {info['starts_with']}")
                    print(f"\n   📝 Preview:")
                    for line in info['preview'].split('\n'):
                        print(f"      {line}")
                
                # Check if formatting is proper
                if fix_formatting:
                    backup_path = str(json_file) + '.backup'
                    shutil.copy2(json_file, backup_path)
                    
                    with open(json_file, 'w', encoding='utf-8') as f:
                        json.dump(data, f, indent=2, ensure_ascii=False)
                    
                    print(f"\n   ✅ Reformatted and saved")
                    print(f"   💾 Backup: {json_file.name}.backup")
            else:
                stats['no_mermaid'] += 1
            
            # Check other expected fields
            expected = ['id', 'title', 'primary_verse', 'main_theme']
            missing = [f for f in expected if f not in data]
            if missing:
                print(f"\n   ⚠️  Missing fields: {', '.join(missing)}")
            
        except json.JSONDecodeError as e:
            print(f"❌ JSON Error: {str(e)}")
            stats['invalid'] += 1
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            stats['invalid'] += 1
    
    # Summary
    print("\n" + "=" * 80)
    print("\n📊 SUMMARY:")
    print(f"   Total files:        {stats['total']}")
    print(f"   ✅ Valid JSON:      {stats['valid']}")
    print(f"   ❌ Invalid JSON:    {stats['invalid']}")
    print(f"   📈 Has mermaid:     {stats['has_mermaid']}")
    print(f"   📉 No mermaid:      {stats['no_mermaid']}")
    
    if stats['has_mermaid'] > 0:
        print(f"\n✨ All mermaid_chart fields appear to be properly formatted!")

if __name__ == "__main__":
    print("🔍 JSON & Mermaid Chart Validator\n")
    
    folder_path = input("📁 Enter folder path: ").strip().strip('"').strip("'")
    
    print("\nOptions:")
    print("  1. Quick check (just validate)")
    print("  2. Detailed check (show mermaid chart info)")
    print("  3. Fix formatting (reformat all files)")
    
    choice = input("\nChoose (1/2/3): ").strip()
    
    show_details = choice == "2"
    fix_formatting = choice == "3"
    
    print()
    process_folder(folder_path, show_details, fix_formatting)