json.array!(@users) do |user|
  json.extract! user, :id, :user_name, :first_name, :family_name, :super_admin, :phone
  json.url user_url(user, format: :json)
end
