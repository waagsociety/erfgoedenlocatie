/* responsible for managing collections */
// We hebben:
// Collections: dit zijn linked data sets.
// CollectionItems: dit zijn individuele items in een collection

function CollectionsController($scope)
{
          //dummy data
      $scope.defaultCollection = [
      { "type": "Feature", "properties": { "id": 8, "Titel": "De Hoop", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/efdf0540-8c17-82e7-0b23-e80ac04991b9.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.913555902187822, 51.652908190029599 ] } },
	  { "type": "Feature", "properties": { "id": 9, "Titel": "Wipmolen van het waterschap Kortrijk", "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/8da697ae-6406-6b0f-cc9a-e407567095c2.jpg" }, "geometry": { "type": "Point", "coordinates": [4.98922840702733, 52.1699429101379000] } },
	  { "type": "Feature", "properties": { "id": 10, "Titel": "Wipmolen De Trouwe Wachter", "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/9165dd5b-34b8-705d-0128-3196d2831677.jpg" }, "geometry": { "type": "Point", "coordinates": [5.09228324892157, 52.1719710554197000] } },
	  { "type": "Feature", "properties": { "id": 11, "Titel": "Molen van de polder Westbroek", "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/a7ea9b10-e456-52dc-630a-255fb86fbbe0.jpg" }, "geometry": { "type": "Point", "coordinates": [5.065292796569, 52.1341959152723000 ] } },
	  { "type": "Feature", "properties": { "id": 12, "Titel": "Spengense Molen", "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/ae2058ce-2bfb-20b7-1eea-091e544d53e3.jpg" }, "geometry": { "type": "Point", "coordinates": [4.93566, 52.1616] } },
      { "type": "Feature", "properties": { "id": 7, "Titel": "De Drie Waaien", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/57f1e541-a240-8d15-ffb4-74f70aecdcaa.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.662566033391347, 51.543412097264124 ] } },
      { "type": "Feature", "properties": { "id": 6, "Titel": "Korenmolens", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/0ce8f248-3858-891f-ecd0-c9f38d6a9e2f.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.566812673041246, 51.456257887993289 ] } },
      { "type": "Feature", "properties": { "id": 5, "Titel": "Standerdmolen", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/49962584-4214-6577-3526-24fa60e5c7b3.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.851171137111242, 51.567316473478755 ] } },
      { "type": "Feature", "properties": { "id": 4, "Titel": "Luyensmolen", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/ad61c552-86f8-417d-9c10-52fdf3670eea.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.743085904594841, 51.573628739573714 ] } },
      { "type": "Feature", "properties": { "id": 3, "Titel": "Geschilderde Muurreclame", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/bbacb103-03a7-99e9-d4ee-2ca78eb914bd.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.546501354179104, 51.572727040935845 ] } },
      { "type": "Feature", "properties": { "id": 2, "Titel": "Onderslagmolen", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/5d34290c-fcba-a85d-813a-d77b80ba0267.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.743085904594841, 51.697442043750883 ] } },
      { "type": "Feature", "properties": { "id": 1, "Titel": "Molenrestant", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/400x400\/c15935bf-5fcb-21be-ed67-e373ad49133a.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.890342966345374, 51.502339427218807 ] } },
      { "type": "Feature", "properties": { "id": 0, "Titel": "De Achtkante Molen", "LONG": 3.0, "LAT": 51.0, "PHOTO": "http:\/\/images.memorix.nl\/rce\/thumb\/800x800\/45fd1cc3-cd0b-bb79-66a0-e017f19af4db.jpg" }, "geometry": { "type": "Point", "coordinates": [ 3.611062331990914, 51.49375913957671 ] } }
     ];

     updateMarkers($scope.defaultCollection); 
}
