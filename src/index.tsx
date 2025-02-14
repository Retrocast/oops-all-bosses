import { render } from "preact";

import "@mantine/core/styles.css";
import {
  Box,
  Button,
  Center,
  DEFAULT_THEME,
  Divider,
  Group,
  Image,
  MantineProvider,
  mergeMantineTheme,
  Stack,
  Text,
  Title,
} from "@mantine/core";

const theme = mergeMantineTheme(DEFAULT_THEME, {
  primaryColor: "red",
  cursorType: "pointer",
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
});

export function App() {
  return (
    <MantineProvider forceColorScheme="dark" theme={theme}>
      <Center h="100vh" w="100vw" style={{ backgroundColor: "black" }}>
        <Stack align="center">
          <Group>
            <Image src="/icon.png" />
            <Divider orientation="vertical" color="red.7" />
            <Title order={1} c="red.7">
              Oops! All bosses!
            </Title>
          </Group>
          <Box maw="750px">
            <Text>
              Are you brave enough to try the challenge that turns every map
              node into a boss battle? It is almost as hard as Skull Storm,
              according to commenters' reactions.{" "}
              <Text span c="red.7" fw={700}>
                No mods required!
              </Text>
            </Text>
            <Text fw={700}>How to play it?</Text>
            <Text>It's very simple!</Text>
            <Text>0. Backup your save file, just in case</Text>
            <Text>
              1. Begin a new Kaycee's Mod run with whatever additional
              challenges you like
            </Text>
            <Text>
              2. Complete first map node (e.g. exchange initial pelts for cards)
            </Text>
            <Text>3. Close the game and upload your save file here</Text>
            <Text>
              4. Downloaded edited save file and put it in place of old one
            </Text>
            <Text>5. Restart the game</Text>
            <Text c="red.7">6. Try not to die!</Text>
            <Text c="gray.5">
              Note: each time you finish a map section, you'll need to complete
              first node on new map and re-upload your save!
            </Text>
          </Box>
          <Button variant="light" onClick={() => alert("Too fast. Too soon.")}>
            Upload save file
          </Button>
        </Stack>
      </Center>
    </MantineProvider>
  );
}

render(<App />, document.getElementById("app"));
