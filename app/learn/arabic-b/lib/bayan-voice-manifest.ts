import type { JourneyWorldId } from "./journey-types";

export type BayanWorldVoice = {
  characterAr: string;
  roleAr: string;
  avatar: string;
  voiceEnv: string;
  dialogueTone: string;
  ambienceLabelAr: string;
  ambiencePrompt: string;
};

export const BAYAN_WORLD_VOICES: Record<JourneyWorldId, BayanWorldVoice> = {
  school: {
    characterAr: "سَارَةُ",
    roleAr: "زَمِيلَتُكَ فِي الْمَدْرَسَةِ",
    avatar: "س",
    voiceEnv: "ELEVENLABS_VOICE_SCHOOL",
    dialogueTone: "friendly young Arabic female, warm, clear, educational",
    ambienceLabelAr: "أَجْوَاءُ الْمَدْرَسَةِ",
    ambiencePrompt: "Modern international school hallway ambience, soft distant students, gentle school bell, no intelligible speech, calm educational atmosphere",
  },
  canteen: {
    characterAr: "عُمَرُ",
    roleAr: "مُوَظَّفُ الْمَقْهَى",
    avatar: "ع",
    voiceEnv: "ELEVENLABS_VOICE_CANTEEN",
    dialogueTone: "friendly young Arabic male barista, natural and welcoming",
    ambienceLabelAr: "أَجْوَاءُ الْمَقْهَى",
    ambiencePrompt: "Warm modern cafe ambience, soft cups and plates, quiet espresso machine, subtle room tone, no intelligible speech",
  },
  market: {
    characterAr: "لَيْلَى",
    roleAr: "بَائِعَةٌ فِي السُّوقِ",
    avatar: "ل",
    voiceEnv: "ELEVENLABS_VOICE_MARKET",
    dialogueTone: "confident friendly Arabic female shop assistant, clear modern standard Arabic",
    ambienceLabelAr: "أَجْوَاءُ السُّوقِ",
    ambiencePrompt: "Clean indoor market ambience, soft footsteps, bags and checkout sounds, distant nonverbal crowd murmur",
  },
  library: {
    characterAr: "مَرْيَمُ",
    roleAr: "أَمِينَةُ الْمَكْتَبَةِ",
    avatar: "م",
    voiceEnv: "ELEVENLABS_VOICE_LIBRARY",
    dialogueTone: "calm articulate Arabic female librarian, patient and refined",
    ambienceLabelAr: "أَجْوَاءُ الْمَكْتَبَةِ",
    ambiencePrompt: "Quiet modern library ambience, gentle page turns, distant footsteps, soft air conditioning, no speech",
  },
  hospital: {
    characterAr: "الدُّكْتُورَةُ نُورُ",
    roleAr: "طَبِيبَةُ الْعِيَادَةِ",
    avatar: "ن",
    voiceEnv: "ELEVENLABS_VOICE_HOSPITAL",
    dialogueTone: "reassuring professional Arabic female doctor, calm and precise",
    ambienceLabelAr: "أَجْوَاءُ الْعِيَادَةِ",
    ambiencePrompt: "Calm modern clinic ambience, soft distant medical equipment, quiet reception room, no alarms and no speech",
  },
  airport: {
    characterAr: "رَنَا",
    roleAr: "مُوَظَّفَةُ السَّفَرِ",
    avatar: "ر",
    voiceEnv: "ELEVENLABS_VOICE_AIRPORT",
    dialogueTone: "professional Arabic female airport agent, crisp, helpful and composed",
    ambienceLabelAr: "أَجْوَاءُ الْمَطَارِ",
    ambiencePrompt: "Spacious modern airport terminal ambience, rolling luggage, distant soft announcement texture without intelligible words, calm crowd",
  },
  university: {
    characterAr: "الدُّكْتُورُ سَامِي",
    roleAr: "الْمُشْرِفُ الْأَكَادِيمِيُّ",
    avatar: "س",
    voiceEnv: "ELEVENLABS_VOICE_UNIVERSITY",
    dialogueTone: "educated mature Arabic male academic, measured, warm and authoritative",
    ambienceLabelAr: "أَجْوَاءُ الْجَامِعَةِ",
    ambiencePrompt: "Modern university campus interior ambience, subtle footsteps and distant room tone, no intelligible speech",
  },
};

export const DIACRITIZED_DIALOGUES: Record<JourneyWorldId, Record<string, string>> = {
  school: {
    listen: "مَرْحَبًا! هَلْ أَنْتَ طَالِبٌ جَدِيدٌ؟ نَعَمْ، أَنَا طَالِبٌ جَدِيدٌ فِي الصَّفِّ السَّابِعِ.",
    discover: "عَفْوًا، أَيْنَ فَصْلُ الصَّفِّ السَّابِعِ؟ فِي الطَّابِقِ الثَّانِي بِجَانِ الْمُخْتَبَرِ.",
    speak: "أَنَا آدَمُ مِنْ قَطَرَ. اِسْمِي يُوسُفُ، وَأَنَا مِنْ مِصْرَ. سَعِدْتُ بِلِقَائِكَ.",
    practice: "مِنْ فَضْلِكَ يَا أُسْتَاذُ، مَا رَقْمُ الصَّفْحَةِ؟ اِفْتَحُوا الصَّفْحَةَ الْخَامِسَةَ عَشْرَةَ.",
    mission: "صَبَاحُ الْخَيْرِ. اِسْمِي يُوسُفُ، وَأَنَا طَالِبٌ جَدِيدٌ. أَبْحَثُ عَنْ فَصْلِ الصَّفِّ السَّابِعِ، مِنْ فَضْلِكَ.",
    assessment: "مَرْحَبًا، اِسْمِي لَيَانُ. أَنَا طَالِبَةٌ جَدِيدَةٌ فِي الصَّفِّ الثَّامِنِ. هَلْ تُسَاعِدُنِي فِي الْوُصُولِ إِلَى الْفَصْلِ؟",
  },
  canteen: {
    listen: "أُرِيدُ شَايًا بِالنَّعْنَاعِ وَقِطْعَةَ كْرُوَاسُون، مِنْ فَضْلِكَ.",
    discover: "مَا الْحَجْمُ؟ صَغِيرٌ أَمْ كَبِيرٌ؟ كَبِيرٌ، وَمِنْ دُونِ سُكَّرٍ، مِنْ فَضْلِكَ.",
    speak: "مَاذَا تُرِيدُ؟ أُرِيدُ سَانْدَوِيتْشَ جُبْنٍ وَعَصِيرَ بُرْتُقَالٍ، مِنْ فَضْلِكَ.",
    practice: "هَلْ يَحْتَوِي هَذَا الطَّبَقُ عَلَى مُكَسَّرَاتٍ؟ لَا، وَلَكِنَّهُ يَحْتَوِي عَلَى الْحَلِيبِ.",
    mission: "أُرِيدُ سَلَطَةً وَعَصِيرًا. كَمِ الْحِسَابُ؟ خَمْسَةٌ وَثَلَاثُونَ رِيَالًا. سَأَدْفَعُ بِالْبِطَاقَةِ.",
    assessment: "مَسَاءُ الْخَيْرِ. أُرِيدُ حَسَاءً وَخُبْزًا وَمَاءً، مِنْ فَضْلِكَ. هَلْ يُمْكِنُنِي الدَّفْعُ نَقْدًا؟",
  },
  market: {
    listen: "بِكَمْ هَذِهِ الْحَقِيبَةُ؟ سِعْرُهَا مِئَةٌ وَعِشْرُونَ رِيَالًا.",
    discover: "أُرِيدُ ثَلَاثَ زُجَاجَاتِ مَاءٍ، مِنْ فَضْلِكَ.",
    speak: "هَذَا الْقَمِيصُ أَرْخَصُ، وَلَكِنَّ الْقَمِيصَ الْأَزْرَقَ أَجْوَدُ.",
    practice: "هَلْ يُوجَدُ مِقَاسٌ أَكْبَرُ مِنْ هَذَا؟ نَعَمْ، لَدَيْنَا مِقَاسٌ كَبِيرٌ.",
    mission: "أُرِيدُ هَذِهِ الْحَقِيبَةَ وَهَذَا الْقَمِيصَ. هَلِ الْمَجْمُوعُ أَقَلُّ مِنْ مِئَتَيْ رِيَالٍ؟",
    assessment: "السِّعْرُ مُنَاسِبٌ، وَلَكِنْ هَلْ يُمْكِنُ أَنْ تُعْطِيَنِي خَصْمًا بَسِيطًا؟",
  },
  library: {
    listen: "أَبْحَثُ عَنْ كِتَابٍ مُبَسَّطٍ عَنْ تَارِيخِ قَطَرَ.",
    discover: "أَيُّ كِتَابٍ تَنْصَحِينَ بِهِ لِلْمُبْتَدِئِينَ؟ أَنْصَحُكَ بِهَذَا الْكِتَابِ الْمُصَوَّرِ.",
    speak: "أُفَضِّلُ الرِّوَايَاتِ الْقَصِيرَةَ وَالْكُتُبَ الْعِلْمِيَّةَ الْمُصَوَّرَةَ.",
    practice: "كَمْ مُدَّةُ الِاسْتِعَارَةِ؟ أُسْبُوعَانِ مِنْ تَارِيخِ الْيَوْمِ.",
    mission: "مَشْرُوعِي عَنِ الْبِيئَةِ فِي قَطَرَ. هَلْ تَنْصَحِينَ بِكِتَابٍ مُنَاسِبٍ؟ أُرِيدُ اسْتِعَارَةَ هَذَا الْكِتَابِ.",
    assessment: "أَبْحَثُ عَنْ مُعْجَمٍ عَرَبِيٍّ مُبَسَّطٍ. فِي أَيِّ قِسْمٍ أَجِدُهُ؟ وَكَمْ مُدَّةُ اسْتِعَارَتِهِ؟",
  },
  hospital: {
    listen: "أَشْعُرُ بِصُدَاعٍ شَدِيدٍ مُنْذُ صَبَاحِ الْيَوْمِ.",
    discover: "أَشْعُرُ بِأَلَمٍ فِي أَسْفَلِ الظَّهْرِ.",
    speak: "الْأَلَمُ مُتَوَسِّطٌ، وَلَكِنَّهُ يَزْدَادُ فِي اللَّيْلِ.",
    practice: "هَلْ لَدَيْكَ حَسَاسِيَّةٌ مِنْ أَيِّ دَوَاءٍ؟ نَعَمْ، لَدَيَّ حَسَاسِيَّةٌ مِنَ الْبِنْسِلِينِ.",
    mission: "أَشْعُرُ بِأَلَمٍ فِي الْحَلْقِ مُنْذُ ثَلَاثَةِ أَيَّامٍ، وَالْأَلَمُ شَدِيدٌ. هَلْ أَحْتَاجُ إِلَى دَوَاءٍ؟",
    assessment: "لَدَيَّ سُعَالٌ وَحَرَارَةٌ مُنْذُ يَوْمَيْنِ، وَأَشْعُرُ بِالتَّعَبِ. بِمَاذَا تَنْصَحِينَ؟",
  },
  airport: {
    listen: "مِنْ فَضْلِكَ، جَوَازُ السَّفَرِ وَالتَّذْكِرَةُ. تَفَضَّلِي، هَذِهِ وَثَائِقِي.",
    discover: "كَمِ الْوَزْنُ الْمَسْمُوحُ لِلْحَقِيبَةِ؟ ثَلَاثُونَ كِيلُوغْرَامًا.",
    speak: "عَفْوًا، أَيْنَ بَوَّابَةُ الصُّعُودِ لِلرِّحْلَةِ إِلَى الْقَاهِرَةِ؟",
    practice: "هَلْ تَأَخَّرَتِ الرِّحْلَةُ؟ نَعَمْ، مَوْعِدُ الْإِقْلَاعِ الْجَدِيدُ السَّاعَةَ التَّاسِعَةَ.",
    mission: "هَذِهِ وَثَائِقِي. هَلْ وَزْنُ الْحَقِيبَةِ مُنَاسِبٌ؟ وَأَيْنَ بَوَّابَةُ الصُّعُودِ؟",
    assessment: "سَمِعْتُ أَنَّ الْبَوَّابَةَ تَغَيَّرَتْ. مَا رَقْمُ الْبَوَّابَةِ الْجَدِيدَةِ؟ وَهَلْ مَوْعِدُ الْإِقْلَاعِ كَمَا هُوَ؟",
  },
  university: {
    listen: "اخْتَرْتُ الْهَنْدَسَةَ لِأَنَّنِي أُحِبُّ حَلَّ الْمُشْكِلَاتِ وَتَصْمِيمَ الْأَشْيَاءِ.",
    discover: "هَلْ يَتَطَلَّبُ الْمُقَرَّرُ مَشْرُوعًا نِهَائِيًّا؟ نَعَمْ، مَعَ عَرْضٍ تَقْدِيمِيٍّ.",
    speak: "يَهْدِفُ مَشْرُوعِي إِلَى مُسَاعَدَةِ الطُّلَّابِ عَلَى تَنْظِيمِ وَقْتِهِمْ وَتَحْسِينِ عَادَاتِ الدِّرَاسَةِ.",
    practice: "مِنْ وِجْهَةِ نَظَرِي، التَّعَلُّمُ الْمُدْمَجُ أَفْضَلُ؛ لِأَنَّهُ يَجْمَعُ بَيْنَ الْمُرُونَةِ وَالتَّفَاعُلِ.",
    mission: "الْمُشْكِلَةُ هِيَ ضَعْفُ تَنْظِيمِ الْوَقْتِ. نَقْتَرِحُ تَطْبِيقًا ذَكِيًّا، وَنَتَوَقَّعُ أَنْ يُسَاعِدَ الطُّلَّابَ عَلَى الِالْتِزَامِ بِخُطَطِهِمْ.",
    assessment: "أَعْتَقِدُ أَنَّ الْفِكْرَةَ قَابِلَةٌ لِلتَّنْفِيذِ؛ لِأَنَّهَا تَعْتَمِدُ عَلَى تَقْنِيَاتٍ مُتَاحَةٍ، وَيُمْكِنُ اخْتِبَارُهَا مَعَ مَجْمُوعَةٍ صَغِيرَةٍ أَوَّلًا.",
  },
};

export function getDialogueAudioUrl(worldId: JourneyWorldId, stageId: string): string {
  return `/audio/bayan/dialogue/${worldId}/${stageId}.mp3`;
}

export function getAmbienceAudioUrl(worldId: JourneyWorldId): string {
  return `/audio/bayan/ambience/${worldId}.mp3`;
}
