# AdventureTrip
![alt text](adventure_trip.logo.png)

## How to
1. Create a new "Source/config/database.yml" file based on the **database_model.yml** file but with your own database's parameters in it.
2. Create a new **roadtrip** database on your server.
3. `bundle install`
4. `rake db:setup`
5. Run server with `rails s`.
6. Go to http://localhost:3000/.