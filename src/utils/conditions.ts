import type { Condition } from "src/types/creatures";



/** Condições padrão: as 42 condições do Pathfinder 2e (Livro Básico p. 618–623). */
export const Conditions: Condition[] = [
    {
        "name": "PF2 - Acelerado",
        "id": "PF2 - Acelerado",
        "description": "Ganha 1 ação adicional no início de cada turno, normalmente limitada aos tipos de ação que o efeito especifica. Ficar acelerado no meio do turno não dá a ação naquele turno. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Agarrado",
        "id": "PF2 - Agarrado",
        "description": "Seguro por outra criatura: fica desprevenido e imobilizado. Ação de manuseio exige teste simples CD 5, ou a ação é perdida. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Amistoso",
        "id": "PF2 - Amistoso",
        "description": "Atitude: a criatura gosta do personagem e tende a aceitar Pedidos simples e seguros. Ações hostis pioram a atitude. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Assustado",
        "id": "PF2 - Assustado",
        "description": "Penalidade de estado igual ao valor em todos os testes e CDs. Ao fim de cada turno da criatura, o valor diminui em 1. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Atordoado",
        "id": "PF2 - Atordoado",
        "description": "Não pode agir. O valor é o total de ações perdidas, possivelmente em vários turnos; desconte das ações recuperadas. Pode ter duração em vez de valor. Sobrepõe lento. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Cego",
        "id": "PF2 - Cego",
        "description": "Não enxerga. Terreno normal vira terreno difícil; falha criticamente em Percepção que dependa de visão; –4 de estado em Percepção se a visão for o único sentido preciso. Imune a efeitos visuais. Sobrepõe ofuscado. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Condenado",
        "id": "PF2 - Condenado",
        "description": "Reduz o valor máximo de morrendo pelo valor de condenado; se chegar a 0, morre. Diminui 1 a cada noite completa de descanso. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Confuso",
        "id": "PF2 - Confuso",
        "description": "Desprevenido, não trata ninguém como aliado, não pode Adiar, Preparar nem usar reações. Gasta as ações em Golpes ou truques ofensivos contra alvos aleatórios. Ao sofrer dano de ataque ou magia, teste simples CD 11 encerra. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Controlado",
        "id": "PF2 - Controlado",
        "description": "Outra criatura decide as ações dele, incluindo ataques, reações e Adiar. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Dano Persistente",
        "id": "PF2 - Dano Persistente",
        "description": "Sofre o dano ao fim de cada turno, rolando os dados. Depois, teste simples CD 15 para encerrar. Ajuda apropriada permite teste extra ou CD 10. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Desajeitado",
        "id": "PF2 - Desajeitado",
        "description": "Penalidade de estado igual ao valor em testes e CDs de Destreza: CA, Reflexos, ataques à distância, Acrobatismo, Furtividade e Ladroagem. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Despercebido",
        "id": "PF2 - Despercebido",
        "description": "A criatura não sabe que você está presente. Também está indetectado para ela. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Desprevenido",
        "id": "PF2 - Desprevenido",
        "description": "–2 de penalidade de circunstância na CA, contra todos ou só contra certas criaturas ou ataques, conforme o efeito. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Drenado",
        "id": "PF2 - Drenado",
        "description": "Penalidade de estado igual ao valor em testes de Constituição (Fortitude). Perde PV e PV máximos iguais a nível × valor. Diminui 1 a cada noite completa de descanso. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Enfraquecido",
        "id": "PF2 - Enfraquecido",
        "description": "Penalidade de estado igual ao valor em testes e CDs de Força: ataques corpo a corpo e dano baseados em Força e Atletismo. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Enjoado",
        "id": "PF2 - Enjoado",
        "description": "Penalidade de estado igual ao valor em todos os testes e CDs. Não ingere nada voluntariamente. 1 ação para regurgitar: Fortitude contra a CD do efeito reduz 1 (2 em sucesso crítico). (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Escondido",
        "id": "PF2 - Escondido",
        "description": "A criatura sabe o quadrado, mas não a posição exata. Fica desprevenida contra você e precisa de teste simples CD 11 para mirá-lo. Efeitos de área ignoram o teste. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Estupefato",
        "id": "PF2 - Estupefato",
        "description": "Penalidade de estado igual ao valor em testes e CDs de Inteligência, Sabedoria e Carisma (Vontade, ataques e CDs de magia). Conjurar exige teste simples CD 5 + valor, ou a magia é interrompida. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Fascinado",
        "id": "PF2 - Fascinado",
        "description": "–2 de estado em Percepção e perícias; não usa ações de concentração alheias ao alvo do fascínio. Encerra se alguém usar ação hostil contra ele ou um aliado. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Fatigado",
        "id": "PF2 - Fatigado",
        "description": "–1 de estado na CA e em salvamentos; não usa atividades de exploração em viagem. Acaba após uma noite completa de descanso. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Ferido",
        "id": "PF2 - Ferido",
        "description": "Ganho ao perder a condição morrendo (ou aumenta 1). Soma-se ao valor de morrendo. Só acaba com Tratar Ferimentos ou com PV totais mais 10 minutos de descanso. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Fugindo",
        "id": "PF2 - Fugindo",
        "description": "Gasta todas as ações para fugir da fonte da condição. Não pode Adiar nem Preparar. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Hostil",
        "id": "PF2 - Hostil",
        "description": "Atitude: a criatura busca ativamente prejudicar o personagem e não aceita Pedidos. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Imobilizado",
        "id": "PF2 - Imobilizado",
        "description": "Não usa ações com o traço movimento. Para movê-lo à força, a força externa precisa vencer a CD de quem o segura. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Inamistoso",
        "id": "PF2 - Inamistoso",
        "description": "Atitude: a criatura não gosta nem confia no personagem e não aceita Pedidos. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Inconsciente",
        "id": "PF2 - Inconsciente",
        "description": "Não pode agir; –4 de estado na CA, Percepção e Reflexos; cego e desprevenido; cai prostrado e larga o que segura. Com 0 PV e morrendo, só desperta com cura. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Indetectado",
        "id": "PF2 - Indetectado",
        "description": "A criatura não sabe seu espaço nem pode mirá-lo, mas efeitos de área o afetam. Fica desprevenida contra você; para atacar, escolhe um quadrado e o Mestre rola em segredo (teste simples CD 11). (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Indiferente",
        "id": "PF2 - Indiferente",
        "description": "Atitude padrão: a criatura não se importa com o personagem. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Invisível",
        "id": "PF2 - Invisível",
        "description": "Não pode ser visto: indetectado para todos. Quem Buscar e vencer sua CD de Furtividade o deixa escondido até você Esgueirar de novo. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Lento",
        "id": "PF2 - Lento",
        "description": "Ao recuperar ações no início do turno, perde ações iguais ao valor. Ficar lento no meio do turno não tira ações daquele turno. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Morrendo",
        "id": "PF2 - Morrendo",
        "description": "Inconsciente. Teste de recuperação no início de cada turno. Sofrer dano aumenta 1 (2 em acerto crítico ou falha crítica). Morre ao chegar a morrendo 4 (menos o valor de condenado). Ao perder a condição, ganha ferido 1. (📖 Livro Básico p. 618–623)",
        "hasAmount": true,
        "startingAmount": 1,
        "amount": 1
    },
    {
        "name": "PF2 - Observado",
        "id": "PF2 - Observado",
        "description": "Visível com um sentido preciso. Quem usa Furtividade pode passar a escondido ou indetectado. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Ocultado",
        "id": "PF2 - Ocultado",
        "description": "Difícil de ver (névoa, por exemplo): quem o mira precisa de teste simples CD 5. Efeitos de área ignoram o teste. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Ofuscado",
        "id": "PF2 - Ofuscado",
        "description": "Se a visão for o único sentido preciso, todas as criaturas e objetos ficam ocultados para você. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Paralisado",
        "id": "PF2 - Paralisado",
        "description": "Desprevenido e não pode agir, exceto Recordar Conhecimento e ações só mentais. Não pode Buscar. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Petrificado",
        "id": "PF2 - Petrificado",
        "description": "Vira estátua: não age nem sente. Objeto com Volume dobrado, CA 9, Dureza 8 e os PV atuais. Se a estátua for destruída, morre. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Prestativo",
        "id": "PF2 - Prestativo",
        "description": "Atitude: a criatura quer ajudar e aceita Pedidos razoáveis que não custem seus objetivos. Ações hostis pioram a atitude. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Prostrado",
        "id": "PF2 - Prostrado",
        "description": "Desprevenido e –2 de circunstância em ataques. Só pode Rastejar e Levantar (Levantar encerra). Obter Cobertura dá +4 na CA contra ataques à distância. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Quebrado",
        "id": "PF2 - Quebrado",
        "description": "Objeto com PV no Limiar de Quebra ou abaixo: não funciona nem dá bônus. Armadura quebrada ainda dá CA, mas impõe –1, –2 ou –3 (leve, média, pesada). (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Restringido",
        "id": "PF2 - Restringido",
        "description": "Desprevenido e imobilizado; não usa ações de ataque ou manuseio, exceto Escapar ou Forçar as amarras. Sobrepõe agarrado. (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Sobrecarregado",
        "id": "PF2 - Sobrecarregado",
        "description": "Desajeitado 1 e –3 metros em todas as Velocidades (mínimo 1,5 metro). (📖 Livro Básico p. 618–623)"
    },
    {
        "name": "PF2 - Surdo",
        "id": "PF2 - Surdo",
        "description": "Falha criticamente em Percepção que dependa de audição; –2 de estado em iniciativa e testes ligados a sons. Ação auditiva exige teste simples CD 5. Imune a efeitos auditivos. (📖 Livro Básico p. 618–623)"
    }
];

/** Aplicada automaticamente a criaturas (não jogadores) que chegam a 0 PV; some se voltarem a ter PV. */
export const MORTO: Condition = {
    name: "Morto",
    id: "morto",
    description: "Reduzida a 0 PV."
};
export const estaMorta = (status: Iterable<Condition>) =>
    [...status].some((s) => s.id === MORTO.id);
