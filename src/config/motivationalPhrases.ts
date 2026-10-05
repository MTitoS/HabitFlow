export interface MotivationalPhrase {
  text: string;
  author: string;
}

export const MOTIVATIONAL_PHRASES: MotivationalPhrase[] = [
  { text: 'A dificuldade é o caminho.', author: 'Sêneca' },
  { text: 'Não é que temos pouco tempo, é que desperdiçamos muito.', author: 'Sêneca' },
  { text: 'Enquanto adiamos, a vida passa.', author: 'Sêneca' },
  { text: 'Sofremos mais na imaginação do que na realidade.', author: 'Sêneca' },
  { text: 'A sorte é o que acontece quando a preparação encontra a oportunidade.', author: 'Sêneca' },
  { text: 'Você tem poder sobre a sua mente, não sobre os eventos.', author: 'Marco Aurélio' },
  { text: 'A melhor vingança é não ser como o seu inimigo.', author: 'Marco Aurélio' },
  { text: 'O obstáculo no caminho torna-se o caminho.', author: 'Marco Aurélio' },
  { text: 'Faça o que precisa ser feito, não o que é fácil.', author: 'Marco Aurélio' },
  { text: 'Se está ao seu alcance, por que reclamar?', author: 'Marco Aurélio' },
  { text: 'Nenhum homem é livre se não é senhor de si.', author: 'Epicteto' },
  { text: 'Não são as coisas que perturbam, mas o julgamento sobre elas.', author: 'Epicteto' },
  { text: 'Primeiro diga a si mesmo o que quer ser; depois faça o que for preciso.', author: 'Epicteto' },
  { text: 'A riqueza não consiste em ter muito, mas em precisar de pouco.', author: 'Epicteto' },
  { text: 'É impossível começar a aprender o que você acha que já sabe.', author: 'Epicteto' },
  { text: 'Você é a sua própria disciplina.', author: 'David Goggins' },
  { text: 'Quando você acha que acabou, na verdade só está começando.', author: 'David Goggins' },
  { text: 'Sem dor, sem progresso.', author: 'David Goggins' },
  { text: 'A mente desiste antes do corpo.', author: 'David Goggins' },
  { text: 'Trabalhe quando ninguém está olhando.', author: 'David Goggins' },
  { text: 'Você não vai acordar na segunda e mudar. A mudança é diária.', author: 'Eric Thomas' },
  { text: 'Quando você quiser vencer tanto quanto quer respirar, aí vence.', author: 'Eric Thomas' },
  { text: 'Não pare quando estiver cansado; pare quando terminar.', author: 'Eric Thomas' },
  { text: 'Disciplina é escolher entre o que você quer agora e o que quer mais.', author: 'Eric Thomas' },
  { text: 'Seja obcecado, não apenas interessado.', author: 'Eric Thomas' },
  { text: 'Disciplina é liberdade.', author: 'Jocko Willink' },
  { text: 'Levante cedo. Trabalhe duro. Fique forte.', author: 'Jocko Willink' },
  { text: 'Todo problema tem solução; você só precisa ir mais fundo.', author: 'Jocko Willink' },
  { text: 'Responsabilidade extrema é o caminho.', author: 'Jocko Willink' },
  { text: 'Não desista do dia. Ganhe o dia.', author: 'Jocko Willink' },
  { text: 'Você não sobe ao nível das metas, cai ao nível dos seus sistemas.', author: 'James Clear' },
  { text: 'Hábitos são os juros compostos do autodesenvolvimento.', author: 'James Clear' },
  { text: 'Não precisa ser extremo, só consistente.', author: 'James Clear' },
  { text: 'Um por cento melhor todo dia.', author: 'James Clear' },
  { text: 'A repetição é a mãe do aprendizado.', author: 'James Clear' },
  { text: 'Jogue o jogo do longo prazo.', author: 'Naval Ravikant' },
  { text: 'Aprender a construir e vender é alavancagem.', author: 'Naval Ravikant' },
  { text: 'A paz de espírito é o objetivo final.', author: 'Naval Ravikant' },
  { text: 'Seja paciente com os resultados, impaciente com as ações.', author: 'Naval Ravikant' },
  { text: 'Escolha um trabalho que você faria de graça e faça-o bem.', author: 'Naval Ravikant' },
  { text: 'A motivação te faz começar; o hábito te faz continuar.', author: 'Jim Rohn' },
  { text: 'Você é a soma dos seus hábitos.', author: 'Jim Rohn' },
  { text: 'A disciplina pesa gramas, o arrependimento pesa toneladas.', author: 'Jim Rohn' },
  { text: 'Não deseje que seja fácil, deseje que você seja melhor.', author: 'Jim Rohn' },
  { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Jim Rohn' },
  { text: 'A excelência não é um ato, mas um hábito.', author: 'Aristóteles' },
  { text: 'Nós somos o que fazemos repetidamente.', author: 'Aristóteles' },
  { text: 'A jornada de mil milhas começa com um passo.', author: 'Lao-Tsé' },
  { text: 'A água que flui nunca apodrece.', author: 'Provérbio chinês' },
  { text: 'Só se vence o que se enfrenta.', author: 'Provérbio popular' },
];

export function phraseForDate(dateKey: string): MotivationalPhrase {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) % 0x7fffffff;
  }
  const index = hash % MOTIVATIONAL_PHRASES.length;
  return MOTIVATIONAL_PHRASES[index];
}
