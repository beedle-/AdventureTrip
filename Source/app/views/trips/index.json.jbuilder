json.array!(@trips) do |trip|
  json.extract! trip, :id, :title, :description, :public, :start_date, :end_date, :transport_id
  json.url trip_url(trip, format: :json)
end
