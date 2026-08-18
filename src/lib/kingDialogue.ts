export type DialogueEmotion = 'normal' | 'angry' | 'afraid' | 'surprised'
  | 'sad' | 'happy' | 'talking';
export type DialogueSpeaker = 'knight' | 'king';
export type DialogueLine = { speaker: DialogueSpeaker; emotion: DialogueEmotion; text: string };

export const KING_POSITION = { x: 9 * 2200 + 1188, y: 48 };

export const KING_DIALOGUE: DialogueLine[] = [
  { speaker: 'knight', emotion: 'surprised', text: 'Кто здесь?! Покажись!' },
  { speaker: 'king', emotion: 'afraid', text: 'Не подходи... Я думал, что они нашли меня.' },
  { speaker: 'knight', emotion: 'surprised', text: 'Эта корона... Вы король?' },
  { speaker: 'king', emotion: 'sad', text: 'Да. Хотя король без королевства — лишь пленник в дорогой мантии.' },
  { speaker: 'knight', emotion: 'talking', text: 'Почему вы не покинули замок?' },
  { speaker: 'king', emotion: 'afraid', text: 'Каждый выход охраняют твари. Ночами я слышал их шаги за стеной.' },
  { speaker: 'knight', emotion: 'angry', text: 'Я пробился через них. Путь наружу почти свободен.' },
  { speaker: 'king', emotion: 'surprised', text: 'Значит, ты тот рыцарь, о котором шептались выжившие...' },
  { speaker: 'knight', emotion: 'talking', text: 'Сейчас не время для легенд. Нужно уходить.' },
  { speaker: 'king', emotion: 'angry', text: 'Нет.' },
  { speaker: 'knight', emotion: 'surprised', text: 'Что?' },
  { speaker: 'king', emotion: 'sad', text: 'Я не уйду, пока не узнаю, что случилось с моим сыном.' },
  { speaker: 'knight', emotion: 'normal', text: 'Принц всё ещё в замке?' },
  { speaker: 'king', emotion: 'talking', text: 'Был. В последний раз его видели у старой башни.' },
  { speaker: 'knight', emotion: 'normal', text: 'Тогда я найду его.' },
  { speaker: 'king', emotion: 'afraid', text: 'Будь осторожен. В башне обитает тот, кто захватил этот замок.' },
  { speaker: 'knight', emotion: 'angry', text: 'Я вернусь. И принц вернётся со мной.' },
  { speaker: 'king', emotion: 'happy', text: 'Если вернёшься живым... у нашего королевства ещё есть надежда.' },
];

export const CHARACTER_NAMES: Record<DialogueSpeaker, string> = {
  knight: 'РЫЦАРЬ', king: 'КОРОЛЬ',
};
