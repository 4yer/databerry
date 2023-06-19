import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import colors from "@mui/joy/colors";
import {
  CssVarsProvider,
  extendTheme,
  StyledEngineProvider,
  ThemeProvider,
} from "@mui/joy/styles";
import React, { ReactElement } from "react";

import ChatBoxFrame from "@app/components/Xiaoque/ChatBoxFrame";

export const theme = extendTheme({
  cssVarPrefix: "xiaoque-chat-iframe",
  colorSchemes: {
    dark: {
      palette: {
        primary: colors.grey,
        background: {
          default: "#111",
        },
      },
    },
    light: {
      palette: {
        primary: colors.blue,
        background: {
          default: "#FFF",
        },
      },
    },
  },
});

const cache = createCache({
  key: "xiaoque-chat-iframe",
  prepend: true,
  speedy: true,
});

const IframeTheme = (props: any) => {
  return (
    <StyledEngineProvider injectFirst>
      <CacheProvider value={cache}>
        <ThemeProvider theme={theme}>
          <CssVarsProvider theme={theme} modeStorageKey="xiaoque-chat-iframe">
            {props.children}
          </CssVarsProvider>
        </ThemeProvider>
      </CacheProvider>
    </StyledEngineProvider>
  );
};

function App() {
  return <ChatBoxFrame initConfig={{ theme: "dark" }} />;
}

App.getLayout = function getLayout(page: ReactElement) {
  return <IframeTheme>{page}</IframeTheme>;
};

export default App;
