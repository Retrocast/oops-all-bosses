import { render } from "preact";

import "@mantine/core/styles.css";
import {
  Center,
  DEFAULT_THEME,
  MantineProvider,
  mergeMantineTheme,
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
        <Title order={1} c="red.7">
          Hello, world!
        </Title>
      </Center>
    </MantineProvider>
  );
}

render(<App />, document.getElementById("app"));
