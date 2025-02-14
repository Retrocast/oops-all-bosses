import { Button, FileButton, Text } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { useState } from "preact/hooks";

export function Editor() {
  let [file, setFile] = useState<File>();
  return (
    <>
      <FileButton accept=".gwsave" onChange={setFile}>
        {(props) => (
          <Button
            leftSection={<IconUpload size={14} />}
            variant="light"
            {...props}
          >
            Upload save file
          </Button>
        )}
      </FileButton>
      {file && (
        <>
          <Text>
            {file.name} - {file.size} bytes (Unchanged)
          </Text>
          <Button
            rightSection={<IconDownload size={14} />}
            variant="light"
            onClick={async () => {
              let link = document.createElement("a");
              link.download = "SaveFile.gwsave";
              link.href = URL.createObjectURL(
                new Blob([await file.arrayBuffer()])
              );
              link.click();
            }}
          >
            Download save file
          </Button>
        </>
      )}
    </>
  );
}
