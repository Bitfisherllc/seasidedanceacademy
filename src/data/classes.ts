export const disclaimer =
  'Classes with less than 4 dancers are subject to cancellation due to low enrollment.';

export const balletGuide =
  'This class is for older children who are interested in learning the art of formal dance instruction. The classes listed below are to be used as a general guide for choosing an appropriate class to start your child. Advancement will be determined by age as well as your child’s mastering the correct alignment and movement of the body. Each class is 2 hours. Three dances in the recital.';

export const hipHopGuide =
  'Hip hop uses energetic music to combine coordination, body isolations, and an aerobic work out to burn off youthful energy in a healthy way. Classes are one hour. One dance in the recital. Tuition, all levels: $64 per month.';

export type DanceClass = {
  id: string;
  name: string;
  ages: string;
  when: string;
  tuition: string;
  summary: string;
  recital?: string;
};

export const classes: DanceClass[] = [
  {
    id: 'dance-grow-1',
    name: 'Dance & Grow 1',
    ages: 'Ages 3 & 4',
    when: 'Mondays 5:00–5:45 or Thursdays 4:30–5:15',
    tuition: '$49 per month',
    summary:
      'A 45-minute class for 3–4 year olds to give them a head start at social skills while learning dance in playful and creative ways. Introduction into movement, stretching, and ballet.',
    recital: 'One dance in the recital.',
  },
  {
    id: 'dance-grow-2',
    name: 'Dance & Grow 2',
    ages: 'Ages 5 & 6',
    when: 'Mondays 5:00–6:00 or Thursdays 5:15–6:15',
    tuition: '$64 per month',
    summary:
      'A 1-hour class that introduces a combination of very basic ballet and tap steps. Introduction into ballet, stretching, and tap. Ballet and tap shoes are required.',
    recital: 'One dance in the recital.',
  },
  {
    id: 'pre-bjt-1',
    name: 'Pre Ballet/Jazz/Tap 1',
    ages: 'Ages 6 & 7',
    when: 'Tuesdays 5:00–6:00',
    tuition: '$64 per month',
    summary:
      'A 1-hour combo class of ballet, jazz, and tap. Level I covers basic barre work and more structured ballet and jazz skills than Dance & Grow 2.',
    recital: 'Two dances in the recital.',
  },
  {
    id: 'pre-bjt-2',
    name: 'Pre Ballet/Jazz/Tap 2',
    ages: 'Ages 7 & 8',
    when: 'Tuesdays 6:00–7:00',
    tuition: '$96 per month',
    summary:
      'A combo class of ballet, jazz, and tap. Level II builds on the basics of barre work and more structured ballet and jazz skills.',
    recital: 'Two dances in the recital.',
  },
  {
    id: 'junior-ballet-lyrical',
    name: 'Junior Ballet/Lyrical',
    ages: 'Ages 9–11',
    when: 'Wednesdays 7:45–8:30',
    tuition: '$49 per month',
    summary:
      'Ballet/lyrical technique including barre warmup, across the floor, and center floor combos.',
    recital: 'Three dances in the recital when taken with Junior Jazz/Tap.',
  },
  {
    id: 'junior-jazz-tap',
    name: 'Junior Jazz/Tap',
    ages: 'Ages 9–11',
    when: 'Wednesdays 6:30–7:45',
    tuition: '$79 per month',
    summary: 'This class focuses on jazz and tap techniques.',
    recital: 'Three dances in the recital when taken with Junior Ballet/Lyrical.',
  },
  {
    id: 'teen-ballet-lyrical',
    name: 'Teen Ballet/Lyrical',
    ages: 'Ages 12 & up',
    when: 'Mondays 5:45–6:30',
    tuition: '$49 per month',
    summary:
      'Ballet/lyrical technique including barre warmup, across the floor, and center floor combos.',
    recital: 'Three dances in the recital when taken with Teen Jazz/Tap.',
  },
  {
    id: 'teen-jazz-tap',
    name: 'Teen Jazz/Tap',
    ages: 'Ages 12 & up',
    when: 'Mondays 6:30–7:45',
    tuition: '$79 per month',
    summary: 'This class focuses on jazz and tap techniques.',
    recital: 'Three dances in the recital when taken with Teen Ballet/Lyrical.',
  },
  {
    id: 'jazz-acro',
    name: 'Jazz/Acro',
    ages: 'Ages 8 & up',
    when: 'Wednesdays 4:30–5:30',
    tuition: '$64 per month',
    summary: 'Combines acrobatic elements with the energetic style of traditional jazz dance.',
  },
  {
    id: 'tiny-tot-hip-hop',
    name: 'Tiny Tot Hip Hop',
    ages: 'Ages 5–7',
    when: 'Tuesdays 5:00–6:00',
    tuition: '$64 per month',
    summary: 'One hour. One dance in the recital.',
    recital: undefined,
  },
  {
    id: 'junior-hip-hop',
    name: 'Junior Hip Hop',
    ages: 'Ages 8–11',
    when: 'Tuesdays 5:00–6:00',
    tuition: '$64 per month',
    summary: 'One hour. One dance in the recital.',
    recital: undefined,
  },
  {
    id: 'teen-hip-hop',
    name: 'Teen Hip Hop',
    ages: 'Ages 12 & up',
    when: 'Tuesdays 7:00–8:00',
    tuition: '$64 per month',
    summary: 'One hour. One dance in the recital.',
    recital: undefined,
  },
  {
    id: 'broadway-baby',
    name: 'Broadway Baby',
    ages: 'Ages 7–9',
    when: 'Mondays 6:00–7:00',
    tuition: '$64 per month',
    summary:
      'A jazz based class filled with Broadway style dancing and music you would typically see on a Broadway stage.',
  },
  {
    id: 'broadway-bound',
    name: 'Broadway Bound',
    ages: 'Ages 10 & up',
    when: 'Tuesdays 7:30–8:30',
    tuition: '$64 per month',
    summary:
      'A jazz based class filled with Broadway style dancing and music you would typically see on a Broadway stage.',
  },
  {
    id: 'junior-pom',
    name: 'Junior Pom',
    ages: 'Ages 8–11',
    when: 'Wednesdays 5:30–6:30',
    tuition: '$64 per month',
    summary:
      'Learning the fundamentals of pom technique, coordination, and confidence in a high-energy environment.',
  },
  {
    id: 'pom-prep',
    name: 'Pom & Dance Team Prep',
    ages: 'Ages 12 & up',
    when: 'Wednesdays 6:30–7:30',
    tuition: '$64 per month',
    summary:
      'Learning the fundamentals of pom technique. Strengthening turns, jumps, and tricks. Gaining knowledge of the collegiate dance team world. Preparation for collegiate dance team clinics, combine events, and auditions.',
  },
  {
    id: 'private-lessons',
    name: 'Private Lessons',
    ages: 'By request',
    when: 'Scheduled upon availability',
    tuition: '$30 per ½ hour',
    summary: 'Request given at the front office. Scheduled upon availability.',
  },
];

export const homeClasses = [
  'dance-grow-1',
  'pre-bjt-1',
  'junior-ballet-lyrical',
  'tiny-tot-hip-hop',
  'jazz-acro',
  'junior-pom',
  'broadway-baby',
  'private-lessons',
].map((id) => classes.find((item) => item.id === id)!);
