import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  FileButton,
  Group,
  MultiSelect,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconDownload, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "preact/hooks";
import { loadSave, editSave, saveSave, checkSave, BOONS } from "./savefile";

export function Editor() {
  let [error, setError] = useState<string | Error>();
  let [status, setStatus] = useState<string>();
  let [save, setSave] = useState<any>();
  let [bosses, setBosses] = useState<string[]>([
    "The Prospector",
    "The Angler",
    "The Trapper",
  ]);
  let [iconsLie, setIconsLie] = useState(false);
  let [boons, setBoons] = useState<string[]>([]);
  let [bears, setBears] = useState<boolean>();
  let [threeLives, setThreeLives] = useState<boolean>();
  let [shortMap, setShortMap] = useState<boolean>(true);
  let [onlyBattles, setOnlyBattles] = useState<boolean>(false);
  let resetRef = useRef<() => void>();
  return (
    <>
      <FileButton
        accept=".gwsave"
        resetRef={resetRef}
        onChange={async (file) => {
          resetRef.current?.();
          try {
            let bytes = new Uint8Array(await file.arrayBuffer());
            let _save;
            try {
              _save = loadSave(bytes);
            } catch {
              // Pretty much any error from loadSave can only be caused by giving it data it does not expect.
              // So this message is more helpful for users than something like JSON parse error.
              setError(
                `Failed to load save file! Are you sure ${file.name} is correct file and it is not corrupt?`
              );
              setSave(null);
              return;
            }
            let [ok, message] = checkSave(_save);
            if (!ok) {
              setError(message);
              setSave(null);
              return;
            }
            setStatus(
              `${file.name} (${(file.size / 1000).toFixed(1)}KB) - ${message}`
            );
            setSave(_save);
            setError(null);
            if (
              _save.ascensionData.currentRun?.playerDeck?.boonIds?.$rcontent
                ?.length
            ) {
              setBoons(
                _save.ascensionData.currentRun.playerDeck.boonIds.$rcontent.map(
                  (boon) => BOONS[boon]
                )
              );
            } else {
              setBoons([]);
            }
            setBears(
              !!_save.ascensionData?.activeChallenges?.$rcontent?.includes?.(13)
            );
            setThreeLives(_save.ascensionData.currentRun?.maxPlayerLives == 3);
          } catch (e) {
            console.error(e);
            setError(e);
            setSave(null);
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
      {save && (
        <>
          <Text>{status}</Text>
          <Group>
            <Stack>
              <MultiSelect
                variant="unstyled"
                label="Bosses to generate"
                value={bosses}
                onChange={(x) => x.length > 0 && setBosses(x)}
                data={["The Prospector", "The Angler", "The Trapper"]}
              />
              <Checkbox
                variant="outline"
                label="Icons lie!"
                description="Map icons may not match actual boss on node"
                checked={iconsLie}
                onChange={(e) => setIconsLie(e.currentTarget.checked)}
              />
              <Checkbox
                variant="outline"
                label="EIGHT FUCKING BEARS"
                description="You know them, you love them"
                checked={bears}
                onChange={(e) => setBears(e.currentTarget.checked)}
              />
            </Stack>
            <Divider orientation="vertical" />
            <Stack>
              <MultiSelect
                variant="unstyled"
                label="Boons"
                description="There's no way you're beating it without boons"
                placeholder={boons.length > 0 ? null : "No boons at all?"}
                value={boons}
                onChange={setBoons}
                data={[
                  "Ambidextrous",
                  "Magpie's Eye",
                  "Starting Goat",
                  "Starting Trees",
                  "+8 bones",
                  "+1 bones",
                ]}
              />
              <Checkbox
                variant="outline"
                label="3 lives"
                description="More smoke or something"
                checked={threeLives}
                onChange={(e) => setThreeLives(e.currentTarget.checked)}
              />
              <Checkbox
                variant="outline"
                label="Short map"
                description={
                  <>
                    Last map node is Leshy's/Royal's boss fight.
                    <br />
                    Beating them ends the run early on first map.
                  </>
                }
                checked={shortMap}
                onChange={(e) => setShortMap(e.currentTarget.checked)}
              />
              <Checkbox
                variant="outline"
                label="Only battles"
                description={
                  <>
                    Only card battle nodes will be replaced.
                    <br />
                    Utility nodes such as Card Choice or Campfire remain on the
                    map.
                  </>
                }
                checked={onlyBattles}
                onChange={(e) => setOnlyBattles(e.currentTarget.checked)}
              />
            </Stack>
          </Group>
          <Button
            rightSection={<IconDownload size={14} />}
            variant="light"
            onClick={async () => {
              let link = document.createElement("a");
              link.download = "SaveFile.gwsave";
              try {
                editSave(
                  save,
                  bosses,
                  iconsLie,
                  boons,
                  bears,
                  threeLives,
                  shortMap,
                  onlyBattles
                );
                link.href = URL.createObjectURL(new Blob([saveSave(save)]));
                link.click();
              } catch (e) {
                console.error(e);
                setError(e);
              }
              setSave(null);
            }}
          >
            Download save file
          </Button>
        </>
      )}
    </>
  );
}
