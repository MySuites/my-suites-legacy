-- Sample exercises for demo user (uses `gen_random_uuid()` for ids)
-- Requires `supabase/seeds/seed_profiles.sql` and `supabase/seeds/seed_muscle_groups.sql` to be run first.

WITH demo AS (
  SELECT id AS user_id
  FROM auth.users
  WHERE email = (
    SELECT value FROM public.seed_metadata WHERE key = 'demo_email'
  )
  LIMIT 1
)
INSERT INTO public.exercises (exercise_id, exercise_name, exercise_type, description, user_id, created_at)
  SELECT gen_random_uuid(), e.name, e.type::type_of_exercise, e.description, demo.user_id, NOW()
FROM demo, (
  VALUES
    -- Weights: Chest
    ('Incline Bench Press', 'weight_reps', 'Barbell incline bench press.'),
    ('Flat Bench Press', 'weight_reps', 'Barbell flat bench press.'),
    ('Decline Bench Press', 'weight_reps', 'Barbell decline bench press.'),
    ('Incline Smith Machine Bench Press', 'weight_reps', 'Smith machine bench press, incline.'),
    ('Flat Smith Machine Bench Press', 'weight_reps', 'Smith machine bench press, flat.'),
    ('Decline Smith Machine Bench Press', 'weight_reps', 'Smith machine bench press, decline.'),
    ('Dumbbell Flys', 'weight_reps', 'Flat or incline dumbbell flys.'),
    ('Cable Flys', 'weight_reps', 'Cable flys for chest thickness.'),
    ('Incline Dumbbell Bench Press', 'weight_reps', 'Dumbbell bench press, incline.'),
    ('Flat Dumbbell Bench Press', 'weight_reps', 'Dumbbell bench press, flat.'),
    ('Decline Dumbbell Bench Press', 'weight_reps', 'Dumbbell bench press, decline.'),
    
    -- Weights: Back
    ('Lat Pulldown', 'weight_reps', 'Cable lat pulldown.'),
    ('Seated Cable Row', 'weight_reps', 'Seated cable row for back thickness.'),

    -- Weights: Shoulders
    ('Face Pull', 'weight_reps', 'Cable face pull for rear delts.'),
    ('Lateral Raise', 'weight_reps', 'Dumbbell lateral raise.'),
    ('Front Raise', 'weight_reps', 'Dumbbell or plate front raise.'),
    ('Arnold Press', 'weight_reps', 'Dumbbell shoulder press with rotation.'),
    
    -- Weights: Legs
    ('Romanian Deadlift', 'weight_reps', 'Barbell or dumbbell RDL.'),
    ('Deadlift', 'weight_reps', 'Barbell deadlift.'),
    ('Bulgarian Split Squat', 'weight_reps', 'Single-leg split squat.'),
    ('Calf Raise', 'weight_reps', 'Standing or seated calf raise.'),
    ('Leg Extension', 'weight_reps', 'Machine leg extension.'),
    ('Leg Curl', 'weight_reps', 'Machine hamstring curl.'),
    ('Barbell Squat', 'weight_reps', 'Barbell squat for quads.'),
    ('Leg Press', 'weight_reps', 'Machine leg press.'),
    ('Smith Machine Squat', 'weight_reps', 'Smith machine squat for quads.'),
    
    -- Weights: Biceps
    ('Barbell Curl', 'weight_reps', 'Barbell curl for biceps.'),
    ('Dumbbell Curl', 'weight_reps', 'Dumbbell curl for biceps.'),
    ('Seated Dumbbell Curl', 'weight_reps', 'Seated dumbbell curl for biceps.'),
    ('Incline Dumbbell Curl', 'weight_reps', 'Dumbbell curl for biceps, incline.'),
    ('Decline Dumbbell Curl', 'weight_reps', 'Dumbbell curl for biceps, decline.'),
    ('Spider Curl', 'weight_reps', 'Spider curl for biceps.'),
    ('Hammer Curl', 'weight_reps', 'Neutral grip dumbbell curl.'),
    ('Cable Curl', 'weight_reps', 'Cable curl for biceps.'),
    ('Incline Cable Curl', 'weight_reps', 'Cable curl for biceps, incline.'),
    ('Decline Cable Curl', 'weight_reps', 'Cable curl for biceps, decline.'),
    ('Preacher Curl', 'weight_reps', 'Preacher curl for biceps.'),

    -- Weights: Triceps
    ('Skullcrusher', 'weight_reps', 'Lying tricep extension.'),
    ('Overhead Tricep Extension', 'weight_reps', 'Overhead tricep extension.'),
    ('Cable Tricep Pushdown', 'weight_reps', 'Cable tricep pushdown.'),
    ('Dumbbell Tricep Pushdown', 'weight_reps', 'Dumbbell tricep pushdown.'),
    ('Tricep Pushdown', 'weight_reps', 'Cable tricep pushdown.'),
    ('Tricep Kickback', 'weight_reps', 'Cable tricep pushdown.'),
    ('Tricep Extension', 'weight_reps', 'Cable tricep pushdown.'),
    ('One-Arm Tricep Extension', 'weight_reps', 'One-arm tricep extension.'),
    
    -- Weights: Abs
    ('Hanging Leg Raise', 'bodyweight_reps', 'Hanging from bar, raising legs.'),
    ('Cable Crunch', 'weight_reps', 'Cable crunch for abs.'),

    -- Bodyweight: Chest and Triceps and Shoulders
    ('Push-up', 'bodyweight_reps', 'Standard push-up.'),
    ('Incline Push-up', 'bodyweight_reps', 'Incline push-up.'),
    ('Decline Push-up', 'bodyweight_reps', 'Decline push-up.'),
    ('Diamond Push-up', 'bodyweight_reps', 'Diamond push-up.'),
    ('Close Push-up', 'bodyweight_reps', 'Close grip push-up.'),
    ('Wide Push-up', 'bodyweight_reps', 'Wide grip push-up.'),
    ('Pike Push-up', 'bodyweight_reps', 'Pike push-up.'),
    ('Pseudo Planche Push-up', 'bodyweight_reps', 'Pseudo planche push-up.'),

    -- Bodyweight: Back and Biceps
    ('Pull-up', 'bodyweight_reps', 'Standard pull-up (overhand grip).'),
    ('Chin-up', 'bodyweight_reps', 'Chin-up (underhand grip).'),
    ('Bodyweight Rows', 'bodyweight_reps', 'Bodyweight rows for back thickness.'),

    -- Bodyweight: Legs
    ('Lunges', 'weight_reps', 'Walking or stationary lunges.'),
    ('Calf Raises', 'bodyweight_reps', 'Calf raises for calf thickness.'),
    ('Bodyweight Squats', 'bodyweight_reps', 'Squats for leg strength.'),
    ('Split Squats', 'bodyweight_reps', 'Split squats for leg strength.'),
    ('Bulgarian Split Squats', 'bodyweight_reps', 'Bulgarian split squats for leg strength.'),
    ('Shrimp Squats', 'bodyweight_reps', 'Shrimp squats for leg strength.'),
    ('Pistol Squats', 'bodyweight_reps', 'Pistol squats for leg strength.'),
    ('Sissy Squats', 'bodyweight_reps', 'Sissy squats for leg strength.'),
    ('Dragon Squats', 'bodyweight_reps', 'Dragon squats for leg strength.'),

    -- Bodyweight: Abs
    ('Plank', 'duration', 'Isometric core strength exercise.'),
    ('Russian Twist', 'bodyweight_reps', 'Seated rotational core exercise.'),
    ('Side Plank', 'duration', 'Isometric core strength exercise.'),

    -- Weighted Bodyweight
    ('Weighted Push-up', 'weighted_bodyweight', 'Weighted push-up.'),
    ('Weighted Pull-up', 'weighted_bodyweight', 'Weighted pull-up (overhand grip).'),
    ('Weighted Chin-up', 'weighted_bodyweight', 'Weighted chin-up (underhand grip).'),
    ('Weighted Rows', 'weighted_bodyweight', 'Weighted rows for back thickness.'),
    ('Weighted Dips', 'weighted_bodyweight', 'Weighted dips for chest thickness.'),
    ('Weighted Lunges', 'weighted_bodyweight', 'Weighted lunges for leg strength.'),
    ('Weighted Plank', 'duration', 'Isometric core strength exercise.'),
    ('Weighted Squat', 'weighted_bodyweight', 'Weighted squat for quads.'),

    -- Advanced Calisthenics Skills
    ('Chest-to-Wall Handstand', 'duration', 'Isometric core strength exercise.'),
    ('Back-to-Wall Handstand', 'duration', 'Isometric core strength exercise.'),
    ('Handstand', 'duration', 'Isometric core strength exercise.'),
    ('Wall Handstand Push-up', 'bodyweight_reps', 'Wall handstand push-up.'),
    ('Handstand Push-up', 'bodyweight_reps', 'Handstand push-up.'),
    ('One-Arm Handstand', 'duration', 'Isometric core strength exercise.'),

    ('Pike Handstand Press', 'bodyweight_reps', 'Pike handstand press for chest thickness.'),
    ('Straddle Handstand Press', 'bodyweight_reps', 'Straddle handstand press for chest thickness.'),
    ('Handstand Press', 'bodyweight_reps', 'Handstand press for chest thickness.'),

    ('Elbow Lever', 'duration', 'Isometric core strength exercise.'),
    ('Bent-Arm Planche', 'duration', 'Isometric core strength exercise.'),
    ('90-Degree Push-up', 'bodyweight_reps', '90-degree push-up.'),

    ('Tuck Planche', 'duration', 'Isometric core strength exercise.'),
    ('Advanced Tuck Planche', 'duration', 'Isometric core strength exercise.'),
    ('Half-Lay Planche', 'duration', 'Isometric core strength exercise.'),
    ('Straddle Planche', 'duration', 'Isometric core strength exercise.'),
    ('Planche', 'duration', 'Isometric core strength exercise.'),
    ('Planche Push-up', 'bodyweight_reps', 'Planche push-up.'),
    ('Maltese', 'duration', 'Isometric core strength exercise.'),
    ('Dragon Maltese', 'duration', 'Isometric core strength exercise.'),

    ('Tuck Front Lever', 'duration', 'Isometric core strength exercise.'),
    ('Advanced Tuck Front Lever', 'duration', 'Isometric core strength exercise.'),
    ('Half-Lay Front Lever', 'duration', 'Isometric core strength exercise.'),
    ('Straddle Front Lever', 'duration', 'Isometric core strength exercise.'),
    ('Front Lever', 'duration', 'Isometric core strength exercise.'),
    ('Front Lever Pull-up', 'bodyweight_reps', 'Front lever pull-up.'),
    ('Front Lever Touch', 'duration', 'Isometric core strength exercise.'),
    ('One-Arm Front Lever', 'duration', 'Isometric core strength exercise.'),
    
    ('Tuck Back Lever', 'duration', 'Isometric core strength exercise.'),
    ('Advanced Tuck Back Lever', 'duration', 'Isometric core strength exercise.'),
    ('Half-Lay Back Lever', 'duration', 'Isometric core strength exercise.'),
    ('Straddle Back Lever', 'duration', 'Isometric core strength exercise.'),
    ('Back Lever', 'duration', 'Isometric core strength exercise.'),
    ('Back Lever Pull-up', 'bodyweight_reps', 'Back lever pull-up.'),
    ('Back Lever Touch', 'duration', 'Isometric core strength exercise.'),
    ('One-Arm Back Lever', 'duration', 'Isometric core strength exercise.'),
    
    ('Frog Stand', 'duration', 'Isometric core strength exercise.'),
    ('Crow Stand', 'duration', 'Isometric core strength exercise.')

) AS e(name, type, description)
WHERE demo.user_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Map exercises to muscle groups (idempotent)

-- Helper temporary table to simplify insertions? 
-- Standard SQL approach is safer.

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'chest'
WHERE e.exercise_name IN (
  'Bench Press', 'Incline Bench Press', 'Flat Bench Press', 'Decline Bench Press',
  'Incline Smith Machine Bench Press', 'Flat Smith Machine Bench Press', 'Decline Smith Machine Bench Press',
  'Dumbbell Flys', 'Cable Flys', 'Incline Dumbbell Bench Press', 'Flat Dumbbell Bench Press', 'Decline Dumbbell Bench Press',
  'Push-up', 'Incline Push-up', 'Decline Push-up', 'Diamond Push-up', 'Close Push-up', 'Wide Push-up', 'Pike Push-up',
  'Weighted Push-up', 'Weighted Dips'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'lats'
WHERE e.exercise_name IN (
  'Pull-up', 'Weighted Pull-up', 'Chin-up', 'Weighted Chin-up', 'Dumbbell Row', 'Lat Pulldown', 'Seated Cable Row',
  'Bodyweight Rows', 'Weighted Rows', 'Front Lever', 'Back Lever'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'quadriceps'
WHERE e.exercise_name IN (
  'Bodyweight Squat', 'Weighted Squat', 'Barbell Squat', 'Smith Machine Squat',
  'Lunges', 'Weighted Lunges', 'Leg Press', 'Bulgarian Split Squat', 'Leg Extension',
  'Pistol Squats', 'Sissy Squats', 'Split Squats', 'Shrimp Squats', 'Dragon Squats'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'hamstrings'
WHERE e.exercise_name IN ('Romanian Deadlift', 'Leg Curl')
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'lower back'
WHERE e.exercise_name IN ('Deadlift')
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'shoulders'
WHERE e.exercise_name IN (
  'Overhead Press', 'Face Pull', 'Lateral Raise', 'Front Raise', 'Arnold Press',
  'Handstand Push-up', 'Wall Handstand Push-up', 'Pike Handstand Press', 'Straddle Handstand Press', 'Handstand Press',
  'Planche Push-up', 'Maltese', 'Planche', 'Handstand'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'abdominals'
WHERE e.exercise_name IN (
  'Plank', 'Weighted Plank', 'Side Plank', 'Russian Twist', 'Hanging Leg Raise', 'Cable Crunch',
  'L-Sit', 'V-Sit', 'Front Lever', 'Back Lever', 'Dragon Flag', 'Elbow Lever'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'biceps'
WHERE e.exercise_name IN (
  'Barbell Curl', 'Dumbbell Curl', 'Seated Dumbbell Curl', 'Incline Dumbbell Curl', 'Decline Dumbbell Curl',
  'Spider Curl', 'Hammer Curl', 'Cable Curl', 'Incline Cable Curl', 'Decline Cable Curl', 'Preacher Curl',
  'Chin-up', 'Weighted Chin-up'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'triceps'
WHERE e.exercise_name IN (
  'Tricep Extension', 'Skullcrusher', 'Tricep Pushdown', 'Overhead Tricep Extension',
  'Cable Tricep Pushdown', 'Dumbbell Tricep Pushdown', 'Tricep Kickback', 'One-Arm Tricep Extension',
  'Push-up', 'Diamond Push-up', 'Weighted Dips'
)
ON CONFLICT DO NOTHING;

INSERT INTO public.exercise_muscle_groups (exercise_id, muscle_group_id, role)
SELECT e.exercise_id, mg.id, 'primary'
FROM public.exercises e
JOIN public.muscle_groups mg ON lower(mg.name) = 'calves'
WHERE e.exercise_name IN ('Calf Raise', 'Calf Raises')
ON CONFLICT DO NOTHING;
