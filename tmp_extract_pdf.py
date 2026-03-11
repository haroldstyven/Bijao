import sys
try:
    import PyPDF2
    with open(sys.argv[1], 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        # Pages 9 to 13 means index 8 to 12
        for i in range(8, 13):
            if i < len(reader.pages):
                print(f"--- PAGE {i+1} ---")
                print(reader.pages[i].extract_text())
except Exception as e:
    print(f"Error: {e}")
