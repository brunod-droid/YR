-- Monthly insights V2: keep existing data, but allow text fields for cleaner management summaries.
-- Run once if your current yr_monthly_insights table has jsonb columns.

alter table public.yr_monthly_insights
  alter column key_themes type text using
    case when key_themes is null then '' when jsonb_typeof(key_themes) = 'string' then key_themes #>> '{}' else key_themes::text end;

alter table public.yr_monthly_insights
  alter column pain_points type text using
    case when pain_points is null then '' when jsonb_typeof(pain_points) = 'string' then pain_points #>> '{}' else pain_points::text end;

alter table public.yr_monthly_insights
  alter column risks type text using
    case when risks is null then '' when jsonb_typeof(risks) = 'string' then risks #>> '{}' else risks::text end;

alter table public.yr_monthly_insights
  alter column wins type text using
    case when wins is null then '' when jsonb_typeof(wins) = 'string' then wins #>> '{}' else wins::text end;

alter table public.yr_monthly_insights
  alter column recommended_actions type text using
    case when recommended_actions is null then '' when jsonb_typeof(recommended_actions) = 'string' then recommended_actions #>> '{}' else recommended_actions::text end;
