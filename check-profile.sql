-- Quick check: What's in your user_profile for the current user?
SELECT 
  user_id,
  full_name,
  phone,
  email,
  nationality,
  national_id,
  job_title
FROM user_profile
WHERE user_id = '5f35e6f0-13e4-47af-9f57-2d4a7de83ab8';

-- If no results, the profile doesn't exist yet!
