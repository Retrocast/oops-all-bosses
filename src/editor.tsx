import { Anchor, Button, FileButton, Text, Textarea } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { useState } from "preact/hooks";

export function Editor() {
  let [file, setFile] = useState<File>();
  let [error, setError] = useState<string | Error>();
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
      {error && (
        <>
          <Text c="red.7">Error!</Text>
          {typeof error == "string" ? (
            <Text c="red.7">{error}</Text>
          ) : (
            <Textarea
              disabled
              variant="unstyled"
              value={error.message + "\n" + error.stack}
              w="100%"
              autosize
              minRows={5}
            ></Textarea>
          )}
          {typeof error != "string" && (
            <Text c="red.7">
              You should probably contact author about it -{" "}
              <Text span c="red">
                @retrcast
              </Text>{" "}
              on Discord or{" "}
              <Anchor href="https://www.reddit.com/user/Comfortable-Roll-490/">
                u/Comfortable-Roll-490/
              </Anchor>{" "}
              on Reddit
            </Text>
          )}
        </>
      )}
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
              setError(new Error("Not implemented"));
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
