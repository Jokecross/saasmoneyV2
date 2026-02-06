-- ============================================
-- SEED DATA - Données de test
-- ============================================

-- Créneaux One of One pour les 2 prochaines semaines
DO $$
DECLARE
  v_date DATE := CURRENT_DATE + INTERVAL '1 day';
  v_end_date DATE := CURRENT_DATE + INTERVAL '14 days';
  v_hours INTEGER[] := ARRAY[10, 14, 16];
  v_hour INTEGER;
BEGIN
  WHILE v_date <= v_end_date LOOP
    -- Skip weekends
    IF EXTRACT(DOW FROM v_date) NOT IN (0, 6) THEN
      FOREACH v_hour IN ARRAY v_hours LOOP
        INSERT INTO public.one_of_one_slots (date, duration, is_available)
        VALUES (
          v_date + (v_hour || ' hours')::INTERVAL,
          30,
          RANDOM() > 0.3 -- 70% disponibles
        );
      END LOOP;
    END IF;
    v_date := v_date + INTERVAL '1 day';
  END LOOP;
END $$;

-- Créneaux HotSet
DO $$
DECLARE
  v_type RECORD;
  v_date DATE := CURRENT_DATE + INTERVAL '1 day';
  v_end_date DATE := CURRENT_DATE + INTERVAL '14 days';
  v_day_counter INTEGER := 0;
BEGIN
  FOR v_type IN SELECT id FROM public.hotset_types LOOP
    v_date := CURRENT_DATE + INTERVAL '1 day';
    v_day_counter := 0;
    
    WHILE v_date <= v_end_date LOOP
      -- Skip weekends
      IF EXTRACT(DOW FROM v_date) NOT IN (0, 6) THEN
        -- Un créneau tous les 3 jours par type
        IF v_day_counter % 3 = 0 THEN
          INSERT INTO public.hotset_slots (type_id, date, is_available)
          VALUES (
            v_type.id,
            v_date + INTERVAL '9 hours',
            RANDOM() > 0.2 -- 80% disponibles
          );
        END IF;
        v_day_counter := v_day_counter + 1;
      END IF;
      v_date := v_date + INTERVAL '1 day';
    END LOOP;
  END LOOP;
END $$;

