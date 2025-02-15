import { Anchor, Button, FileButton, Text, Textarea } from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "preact/hooks";
import { loadSave, editSave, saveSave } from "./savefile";

export function Editor() {
  let [file, setFile] = useState<File>();
  let [error, setError] = useState<string | Error>();
  let [status, setStatus] = useState<string>();
  let [save, setSave] = useState<any>();
  let resetRef = useRef<() => void>();
  return (
    <>
      <FileButton
        accept=".gwsave"
        resetRef={resetRef}
        onChange={async (_file) => {
          resetRef.current?.();
          try {
            let bytes = new Uint8Array(await _file.arrayBuffer());
            let _save;
            try {
              _save = loadSave(bytes);
            } catch {
              // Pretty much any error from loadSave can only be caused by giving it data it does not expect.
              // So this message is more helpful for users than something like JSON parse error.
              return setError(
                `Failed to load save file! Are you sure ${_file.name} is correct file and it is not corrupt?`
              );
            }
            let [ok, message] = editSave(_save);
            if (!ok) return setError(message);
            setStatus(message);
            setFile(_file);
            setSave(_save);
            setError(null);
          } catch (e) {
            console.error(e);
            setError(e);
          }
        }}
      >
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
            {file.name} - {file.size} bytes ({status})
          </Text>
          <Button
            rightSection={<IconDownload size={14} />}
            variant="light"
            onClick={async () => {
              let link = document.createElement("a");
              link.download = "SaveFile.gwsave";
              try {
                link.href = URL.createObjectURL(new Blob([saveSave(save)]));
                link.click();
              } catch (e) {
                console.error(e);
                setError(e);
              }
            }}
          >
            Download save file
          </Button>
        </>
      )}
    </>
  );
}
