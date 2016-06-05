class TripsController < ApplicationController
  before_action :set_trip, only: [:show, :edit, :update, :destroy]
  # Allows disconnected users to access the index and show pages only.
  before_filter:authenticate_user!, except: [:index, :show]

  # GET /trips
  # GET /trips.json
  def index
    if user_signed_in?
        sqlRequest = "
            SELECT *
            FROM trips AS t
            WHERE public = 1
                OR id IN (SELECT p.trip_id FROM permissions AS p WHERE p.user_id = ?)"
        @trips = Trip.find_by_sql [sqlRequest, current_user.id]
    else
        @trips = Trip.where(public: 1)
    end
  end

  # GET /trips/1
  # GET /trips/1.json
  def show
    @comments = @trip.comments
    @comment = Comment.new

    users_ids = Permission.select(:user_id).where(trip_id: @trip.id)
    @users = User.where(:id => users_ids)

    @transport = Transport.find(@trip.transport_id).name
  end

  # GET /trips/new
  def new
    @trip = Trip.new
    @transports = Transport.all
    @users = User.where.not(id: current_user.id)
  end

  # GET /trips/1/edit
  def edit
    @transports = Transport.all

    # Get participants of the trip.
    users_ids = Permission.select(:user_id).where(trip_id: @trip.id)
    @participants = User.where(:id => users_ids)
    # Get users who don't belong to the trip.
    @users = User.where.not(:id => users_ids)
  end

  # POST /trips
  # POST /trips.json
  def create
    @trip = Trip.new(trip_params)

    respond_to do |format|
      if @trip.save
        # Create current user's admin permission on the new created trip.
        adminPerm = Permission.new(:user_id => current_user.id, :trip_id => @trip.id, :permission_type_id => Permission_type.find_by(permission: "admin").id)
        adminPerm.save

        # Get the permission's type which represent an usual user.
        permUser = Permission_type.find_by(permission: "user").id
        # Create a "user" permission for each selected users.
        if params["users"]
            params["users"].each do |user|
              perm = Permission.new(:user_id => user, :trip_id => @trip.id, :permission_type_id => permUser)
              perm.save
            end
        end

        # Create each waypoint of the trip.
        if params['waypoints']
            i = 0
            params['waypoints'].each do |waypoint|
                i += 1
                w = Stop.new(:title => @trip.title + " - #{i}", :loc_lat => waypoint[1][0], :loc_lon => waypoint[1][1], :trip_id => @trip.id, :etape_nb => i)
                w.save
            end

            # If the endpoint is also the startpoint, add an extra stop.
            if params['arrivalEqualsStart']
                w = Stop.new(:title => @trip.title + " - #{i + 1}", :loc_lat => params["waypoints"]["0"][0], :loc_lon => params["waypoints"]["0"][1], :trip_id => @trip.id, :etape_nb => (i + 1))
                w.save
            end
        end

        format.html { redirect_to @trip, notice: 'Trip was successfully created.' }
        format.json { render :show, status: :created, location: @trip }
      else
        format.html { render :new }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /trips/1
  # PATCH/PUT /trips/1.json
  def update
     #abort(params["waypoints"]["0"][1].inspect)
     respond_to do |format|
      if @trip.update(trip_params)
        # Get the permission's type which represent an usual user.
        permUser = Permission_type.find_by(permission: "user").id

        # Remove each current permission.
        Permission.where(trip_id: @trip.id).each do |p|
            p.destroy
        end
        # Create current user's admin permission on the new created trip.
        adminPerm = Permission.new(:user_id => current_user.id, :trip_id => @trip.id, :permission_type_id => Permission_type.find_by(permission: "admin").id)
        adminPerm.save
        # Create a "user" permission for each selected users.
        if params["users"]
            params["users"].each do |user|
                perm = Permission.new(:user_id => user, :trip_id => @trip.id, :permission_type_id => permUser)
                perm.save
            end
        end

        # Remove each current waypoint.
        Stop.where(trip_id: @trip.id).each do |s|
            s.destroy
        end
        # Create each waypoint of the trip.
        if params['waypoints']
            i = 0
            params['waypoints'].each do |waypoint|
                i += 1
                w = Stop.new(:title => @trip.title + " - #{i}", :loc_lat => waypoint[1][0], :loc_lon => waypoint[1][1], :trip_id => @trip.id, :etape_nb => i)
                w.save
            end

            # If the endpoint is also the startpoint, add an extra stop.
            if params['arrivalEqualsStart']
                w = Stop.new(:title => @trip.title + " - #{i + 1}", :loc_lat => params["waypoints"]["0"][0], :loc_lon => params["waypoints"]["0"][1], :trip_id => @trip.id, :etape_nb => (i + 1))
                w.save
            end
        end

        format.html { redirect_to @trip, notice: 'Trip was successfully updated.' }
        format.json { render :show, status: :ok, location: @trip }
      else
        format.html { render :edit }
        format.json { render json: @trip.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /trips/1
  # DELETE /trips/1.json
  def destroy
    # First delete trip's permissions.
    @trip.permissions.each do |perm|
        perm.destroy
    end

    # Then delete the trip itself.
    @trip.destroy
    respond_to do |format|
      format.html { redirect_to trips_url, notice: 'Trip was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_trip
      @trip = Trip.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def trip_params
      params.require(:trip).permit(:title, :description, :public, :start_date, :end_date, :transport_id)
    end
end
