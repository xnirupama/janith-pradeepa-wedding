import hemandraHall from "../../public/assets/wedding/photos/Hemandra Grand Hotel 1.jpg";
import hemandraEntrance from "../../public/assets/wedding/photos/Hemandra Grand Hotel 2.jpg";
import senwinHall from "../../public/assets/homecoming/photos/Senwin Mandeer 1.jpeg";
import senwinExterior from "../../public/assets/homecoming/photos/Senwin Mandeer 2.jpeg";

const venuePhotos = {
  wedding: [
    { image: hemandraEntrance, altKey: "venuePhotoEntrance" },
    { image: hemandraHall, altKey: "venuePhotoInterior" },
  ],
  homecoming: [
    { image: senwinExterior, altKey: "venuePhotoExterior" },
    { image: senwinHall, altKey: "venuePhotoInterior" },
  ],
};

export default venuePhotos;
