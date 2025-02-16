// Taken from https://github.com/jlcrochet/inscryption_save_editor
// Check out this awesome project, you'll need a save editor anyway.

import { randomChoice } from "./utils";

// There's no way anyone's beating this legit.
function normalizeJSON(bytes: Uint8Array): Uint8Array {
  let output: number[] = [];
  let regions: string[] = [];
  let coordinateX = true;
  let isKey = true;
  for (let i = 0; i < bytes.length; i += 1) {
    let b = bytes[i];
    let last_region = regions.at(-1);
    if (b <= 0x20) {
      if (last_region == "string") output.push(b);
    } else if (b == 0x22) {
      if (last_region == "string") regions.pop();
      else regions.push("string");
      output.push(b);
    } else if (b == 0x2d || (b >= 0x30 && b <= 0x39)) {
      if (last_region == "object" && isKey) {
        output.push(0x22, coordinateX ? 0x78 : 0x79, 0x22, 0x3a);
        coordinateX = !coordinateX;
        while (b == 0x2d || b == 0x2e || (b >= 0x30 && b <= 0x39)) {
          output.push(b);
          i += 1;
          b = bytes[i];
        }
        i -= 1;
      } else {
        output.push(b);
      }
    } else if (b == 0x3a) {
      if (last_region == "object") isKey = false;
      output.push(b);
    } else if (b == 0x5b) {
      if (last_region != "string") regions.push("array");
      output.push(b);
    } else if (b == 0x7b) {
      if (last_region != "string") regions.push("object");
      output.push(b);
    } else if (b == 0x5d) {
      if (last_region == "array") regions.pop();
      output.push(b);
    } else if (b == 0x7d) {
      if (last_region == "object") {
        regions.pop();
        isKey = true;
      }
      output.push(b);
    } else if (b == 0x2c) {
      if (last_region == "object") isKey = true;
      output.push(b);
    } else if (b == 0x24) {
      if (last_region == "string") {
        output.push(b);
      } else {
        output.push(0x22);
        while (b > 0x20 && b != 0x2c && b != 0x5d && b != 0x7d) {
          output.push(b);
          i += 1;
          b = bytes[i];
        }
        i -= 1;
        output.push(0x22);
      }
    } else {
      output.push(b);
    }
  }
  return Uint8Array.from(output);
}

export function loadSave(bytes: Uint8Array): any {
  return JSON.parse(new TextDecoder().decode(normalizeJSON(bytes)));
}

export function saveSave(save: any): string {
  return JSON.stringify(save).replaceAll(/"(\$iref:\d+)"/g, (x) =>
    x.replaceAll('"', "")
  );
}

let nodeCounter = 0;

function crawlNode(node: any, callback?: (node: any) => void) {
  if (typeof node == "string" || !node) return;
  if (node.connectedNodes) {
    if (callback) callback(node);
    nodeCounter++;
    node.connectedNodes.$rcontent.forEach((_node) =>
      crawlNode(_node, callback)
    );
  }
}

const BOSSES = {
  "The Prospector": ["ProspectorBattleSequencer", 3],
  "The Angler": ["AnglerBattleSequencer", 4],
  "The Trapper": ["TrapperTraderBattleSequencer", 6],
};

export const BOONS = [
  "None",
  "Ambidextrous",
  "Magpie's Eye",
  "Rabid Squirrel",
  "Starting Goat",
  "Starting Trees",
  "+8 bones",
  "+1 bones",
];

function editNodes(nodes: any[], bosses: string[], iconsLie: boolean) {
  nodes.forEach((rootNode) =>
    crawlNode(rootNode, (node) => {
      node.$type = "1337|DiskCardGame.BossBattleNodeData, Assembly-CSharp";
      node.difficulty = 15;
      let [id, type] = BOSSES[randomChoice(bosses)];
      node.specialBattleId = id;
      node.bossType = iconsLie ? randomChoice([3, 4, 6]) : type;
      node.blueprint = null;
    })
  );
}

const REGIONS = [
  "The Woodlands",
  "The Wetlands",
  "The Snow Line",
  "Finale",
  "???",
];

export function checkSave(save: any): [boolean, string] {
  if (!save.ascensionData || !save.ascensionData.currentRun)
    return [
      false,
      "Failed to get KM data! Are you sure you've started the run?",
    ];
  if (!save.ascensionData.currentRun.map)
    return [
      false,
      "Failed to get map data! Are you sure you've finished the first node?",
    ];
  if (
    !save.ascensionData.currentRun.map.nodeData ||
    !save.ascensionData.currentRun.map.nodeData.$rcontent
  )
    return [false, "Failed to get node data! Are you sure save isn't corrupt?"];
  nodeCounter = 0;
  save.ascensionData.currentRun.map.nodeData.$rcontent.forEach((node) =>
    crawlNode(node)
  );
  if (nodeCounter == 0)
    return [false, "No node data found! Are you sure save isn't corrupt?"];
  return [
    true,
    REGIONS[
      save.ascensionData.currentRun.regionOrder.$pcontent[
        save.ascensionData.currentRun.regionTier
      ] ?? 4
    ],
  ];
}

export function editSave(
  save: any,
  bosses: string[],
  iconsLie: boolean,
  boons: string[],
  bears: boolean
): number {
  nodeCounter = 0;
  editNodes(
    save.ascensionData.currentRun.map.nodeData.$rcontent,
    bosses,
    iconsLie
  );
  save.ascensionData.currentRun.eyeState = 3;
  if (boons.length > 0) {
    save.ascensionData.currentRun.playerDeck.boonIds ??= {
      $type:
        "System.Collections.Generic.List`1[[DiskCardGame.BoonData+Type, Assembly-CSharp]], mscorlib",
      $rlength: 0,
      $rcontent: [],
    };
    save.ascensionData.currentRun.playerDeck.boonIds.$rlength = boons.length;
    save.ascensionData.currentRun.playerDeck.boonIds.$rcontent = boons.map(
      (name) => BOONS.findIndex((x) => name == x)
    );
  }
  save.ascensionData.activeChallenges ??= {
    $type:
      "System.Collections.Generic.List`1[[DiskCardGame.AscensionChallenge, Assembly-CSharp]], mscorlib",
    $rlength: 0,
    $rcontent: [],
  };
  if (bears) {
    if (!save.ascensionData.activeChallenges.$rcontent.includes(13)) {
      save.ascensionData.activeChallenges.$rcontent.push(13);
      save.ascensionData.activeChallenges.$rlength++;
    }
  } else {
    if (save.ascensionData.activeChallenges.$rcontent.includes(13)) {
      save.ascensionData.activeChallenges.$rcontent.splice(
        save.ascensionData.activeChallenges.$rcontent.findIndex((x) => x == 13)
      );
      save.ascensionData.activeChallenges.$rlength--;
    }
  }
  return nodeCounter;
}
