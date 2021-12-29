import React, { useState, useCallback, useMemo, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import {
  Paper,
  Text,
  Button,
  Code,
  Card,
  Badge,
  Collapse,
  Group,
  useMantineTheme,
} from "@mantine/core";
import { marketName } from "../markets";
import Moment from "react-moment";

const MarketDataFeed = ({ symbols }) => {
  //Public API that will echo messages sent to it back to the client
  const [socketUrl, setSocketUrl] = useState(
    "wss://serum-vial.staratlas.cloud/v1/ws"
  );

  console.log(`symbols`, symbols)
  const messageHistory = useRef([]);

  const { sendMessage, lastMessage, readyState, getWebSocket } = useWebSocket(
    socketUrl,
    {
      onOpen: () => {
        const subscribeL2 = {
          op: "subscribe",
          channel: "level2",
          markets: symbols,
        };

        const subscribeL3 = {
          op: "subscribe",
          channel: "level3",
          markets: symbols,
        };

        sendMessage(JSON.stringify(subscribeL2));
        // sendMessage(JSON.stringify(subscribeL3));
      },
    }
  );

  messageHistory.current = useMemo(
    () => messageHistory.current.concat(lastMessage),
    [lastMessage]
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  return (
    <div className="flex flex-col gap-y-2 max-w-md mt-8">
      <div className="flex gap-x-4">
        <span>The WebSocket is currently {connectionStatus}</span>
        <Button
          color="red"
          variant="outline"
          size="xs"
          onClick={() => {
            getWebSocket().close();
          }}
          disabled={readyState !== ReadyState.OPEN}
        >
          Disconnect
        </Button>
      </div>
      {/* {lastMessage ? <span>Last message: {lastMessage.data}</span> : null} */}
      <div className="flex flex-col">
        {messageHistory.current
          .reverse()
          .filter((message) => {
            if (!message || !message.data) return false;
            const data = JSON.parse(message.data);
            if (data.type === "subscribed") return false;
            // return true;
            return data.type === "l2snapshot";
            // return data.type !== "l2snapshot" && data.type !== "l2update";
          })
          .map((message, idx) =>
            idx > 0 ? null : (
              <MessageCard message={message} startsMinimized={false} />
            )
          )}
      </div>
    </div>
  );
};

function MarketSize({ title, data }) {
  return (
    <div className="flex flex-col">
      <div className="font-bold text-lg">{title}</div>
      {!data.length && <div>None</div>}
      {data.map((x) => (
        <div className="flex flex-row justify-start gap-x-6">
          <p className="w-8 font-mono text-xs">x{x.size}</p>
          <p className="font-mono">{x.price}</p>
        </div>
      ))}
    </div>
  );
}

function MessageCard({ message, startsMinimized }) {
  const [opened, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);

  const theme = useMantineTheme();

  console.log(message);

  const secondaryColor =
    theme.colorScheme === "dark" ? theme.colors.dark[1] : theme.colors.gray[7];

  if (!message) {
    return null;
  }

  const data = JSON.parse(message.data);

  return (
    <Card className="my-1" shadow="sm" padding="xs">
      <Group
        position="apart"
        style={{ marginBottom: 5, marginTop: theme.spacing.sm }}
      >
        <Text weight={500} onClick={() => setOpen(!opened)}>
          {" "}
          <Moment fromNow ago interval={1}>
            {data.timestamp}
          </Moment>
        </Text>
        <Badge
          color="pink"
          variant="light"
          onClick={() => setMinimized(!minimized)}
        >
          {data.type}
        </Badge>
      </Group>
      {data.type == "l2snapshot" && (
        <div className="flex flex-row text-white justify-between">
          <MarketSize
            title="Asks"
            data={data.asks.map((x) => {
              return { price: x[0], size: x[1] };
            })}
          />
          <MarketSize
            title="Bids"
            data={data.bids.map((x) => {
              return { price: x[0], size: x[1] };
            })}
          />
        </div>
      )}

      <Collapse in={minimized}>
        <Collapse in={opened}>
          <Code>{JSON.stringify(data, null, 2)}</Code>
        </Collapse>
      </Collapse>
    </Card>
  );
}

export default MarketDataFeed;
