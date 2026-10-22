import { normalizePath, TFile } from "obsidian";
import type InitiativeTracker from "../main";
import type { Creature } from "../utils/creature";

import { tracker } from "src/tracker/stores/tracker";
import type { UpdateLogMessage } from "./logger.types";

export interface LogState {
    name?: string;
    players: Creature[];
    creatures: Creature[];
    round: number;
}

export default class Logger {
    public async setLogFile(logFile: string) {
        this.logFile = logFile;
        this.logging = true;

        await this.setFile();
    }
    public getLogFile() {
        return this.logFile ? normalizePath(this.logFile) : "";
    }
    private logFile: string;
    async setFile() {
        const file = (await this.adapter.exists(normalizePath(this.logFile)))
            ? await this.vault.getAbstractFileByPath(
                  normalizePath(this.logFile)
              )
            : await this.vault.create(this.logFile, ``);

        if (file instanceof TFile) {
            this.file = file;
        }
    }
    getFile(): TFile {
        return this.file;
    }
    private file: TFile;
    constructor(public plugin: InitiativeTracker) {}
    get enabled() {
        return this.plugin.data.logging;
    }
    get folder() {
        return this.plugin.data.logFolder;
    }
    get vault() {
        return this.plugin.app.vault;
    }
    get adapter() {
        return this.plugin.app.vault.adapter;
    }
    logging = false;
    async new(logFile: string): Promise<void>;
    async new(state: LogState): Promise<void>;
    async new(param: string | LogState) {
        if (!this.enabled) return;

        if (typeof param == "string") {
            await this.setLogFile(param);
        } else {
            await this.setLogFile(
                `${this.folder}/${Date.now()} - ${param.name ?? "Combat"}.md`
            );
            await this.log(
                `**Combate iniciado em ${new Date().toLocaleString()}**\n\n`
            );
            await this.log("## Jogadores");
            await this.log("| Jogador | Iniciativa | PV | Condições |");
            await this.log("| --- | :-: | :-: | :-: |");
            for (const player of param.players.sort(
                (a, b) => b.initiative - a.initiative
            )) {
                await this.log(
                    "|",
                    player.getName().replace("|", "\\|"),
                    "|",
                    player.initiative.toString(),
                    "|",
                    player.hp ? `${player.hp}/${player.max}` : "-",
                    "|",
                    [
                        ...(player.status.size
                            ? [...player.status].map((c) => c.name)
                            : ["-"])
                    ]
                        .join(", ")
                        .replace("|", "\\|"),
                    "|"
                );
            }
            await this.log("## Criaturas");
            await this.log("| Criatura | Iniciativa | PV | Condições |");
            await this.log("| --- | :-: | :-: | :-: |");
            for (const creature of param.creatures.sort(
                (a, b) => b.initiative - a.initiative
            )) {
                await this.log(
                    "|",
                    creature.getName().replace("|", "\\|"),
                    "|",
                    creature.initiative.toString(),
                    "|",
                    creature.hp ? `${creature.hp}/${creature.max}` : "-",
                    "|",
                    [
                        ...(creature.status.size
                            ? [...creature.status].map((c) => c.name)
                            : ["-"])
                    ]
                        .join(", ")
                        .replace("|", "\\|"),
                    "|"
                );
            }

            await this.log("\n\n## Registro do combate");
            await this.log("\n### Rodada 1");
            await this.log(
                `\n##### Turno de ${tracker.getOrderedCreatures()[0].getName()}`
            );
        }
    }
    async log(...msg: string[]) {
        if (!this.enabled) return;
        if (!this.file) return;
        if (!(await this.adapter.exists(this.logFile))) {
            await this.setLogFile(this.logFile);
        }
        await this.vault.append(this.file, `${msg.join(" ")}\n`);
    }
    public join(strings: string[], joiner: string = "e") {
        if (strings.length == 1) {
            return strings[0];
        }
        return `${strings.slice(0, -1).join(", ")} ${joiner} ${strings.slice(
            -1
        )}`;
    }
    logUpdate(messages: UpdateLogMessage[]) {
        const toLog: string[] = [];
        for (const message of messages) {
            const perCreature: string[] = [];
            if (message.hp) {
                if (message.temp) {
                    perCreature.push(
                        `${message.name} ganhou ${(
                            -1 * message.hp
                        ).toString()} PV temporários`
                    );
                } else if (message.max) {
                    if (message.hp < 0) {
                        perCreature.push(
                            `${message.name} sofreu ${(
                                -1 * message.hp
                            ).toString()} de dano nos PV máximos${
                                message.unc ? " e morreu" : ""
                            }`
                        );
                    } else {
                        perCreature.push(
                            `${
                                message.name
                            } ganhou ${message.hp.toString()} PV máximos`
                        );
                    }
                } else if (message.hp < 0) {
                    perCreature.push(
                        `${message.name} sofreu ${(
                            -1 * message.hp
                        ).toString()} de dano${
                            message.unc ? " e ficou inconsciente" : ""
                        }`
                    );
                } else if (message.hp > 0) {
                    perCreature.push(
                        `${
                            message.name
                        } recuperou ${message.hp.toString()} PV`
                    );
                }
            }
            if (message.ac) {
                if (perCreature.length && !message.status) {
                    perCreature.push("e");
                } else if (perCreature.length) {
                    perCreature.push(",");
                }

                if (message.ac_add) {
                    perCreature.push(
                        `${message.name} somou ${message.ac} à CA`
                    );
                } else {
                    perCreature.push(
                        `${message.name} teve a CA definida como ${
                            message.ac ? message.ac : "vazia"
                        }`
                    );
                }
            }
            if (message.status) {
                if (perCreature.length) {
                    perCreature.push("e");
                } else {
                    perCreature.push(message.name);
                }
                let status;
                if (message.status.length > 1) {
                    status = [
                        message.status
                            .slice(0, message.status.length - 1)
                            .join(", ")
                    ];
                    status.push(message.status[message.status.length - 1]);
                } else {
                    status = [message.status[0]];
                }
                if (message.saved) {
                    perCreature.push(`passou no salvamento contra ${status.join(" e ")}`);
                } else {
                    perCreature.push(`recebeu a condição ${status.join(" e ")}`);
                }
            }
            if (message.remove_status) {
                if (perCreature.length) {
                    perCreature.push("e");
                } else {
                    perCreature.push(message.name);
                }
                let status;
                if (message.remove_status.length > 1) {
                    status = [
                        message.remove_status
                            .slice(0, message.remove_status.length - 1)
                            .join(", ")
                    ];
                    status.push(message.remove_status[message.remove_status.length - 1]);
                } else {
                    status = [message.remove_status[0]];
                }
                perCreature.push(`perdeu a condição ${status.join(" e ")}`);
            }
            toLog.push(perCreature.join(" "));
        }
        this.log(`${toLog.join(". ")}.`);
    }
}
