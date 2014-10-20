ErfGeoViewer
================

##Introductie

Van 7 juli tot 4 augustus heeft Waag Society in opdracht van Digitaal Erfgoed Nederland gewerkt aan een prototype ten behoeve van Stichting Bibliotheek.nl/Koninklijke Bibliotheek voor een web-viewer die digitaal-erfgoedcollecties voor het project Erfgoed & Locatie toont. 

Er is gekozen voor een opzet van het prototype van een linked data viewer waarbij een breed publiek zich zo veel mogelijk aangesproken kan voelen, voor een viewer die het ontdekken en vertellen van verhalen faciliteert. Op basis van die filosofie is een gebruikersinterface gemaakt waarbij het beeld een prominente rol speelt.

Omdat het prototype een demonstrator moet zijn en een interface voor een semantisch web toepassing, is er voor gekozen om in de gebruikersinterface nu niet alle puntjes op de i te zetten maar juist op semantiek gebaseerde zoekmogelijkheden toe te voegen en de deelaspecten tijd, plaats, onderwerp en collectie te behandelen.

De resultaten van de code sprint zijn live draaiende op  http://erfgoedenlocatie.cloud.tilaa.com/erfgoedenlocatie/src/

##Data

Voor het prototype is met ‘echte’ data gewerkt vanuit het semantisch web-gedachtegoed. Dit houdt in dat resources met web-adressen (URI’s) zijn gebruikt, er standaard ontologieën zijn toegepast en beschreven waar mogelijk en dat open data is gebruikt die via semantisch-webstandaarden op te vragen zijn.

De data bestond uit twee hoofdsets: de molen-beeldbank als Linked Data set zoals bewerkt en gepubliceerd op [CollectieGebouwd](http://data.metamatter.nl/molens/Collectiegebouwd) en afkomstig van de molen-dataset gepubliceerd door de Rijksdienst voor het Cultureel Erfgoed. De beelden worden gehost door Picturae. De geografische component is beschreven met het  [wgs84_pos](http://www.w3.org/2003/01/geo/wgs84_pos) vocabulaire en omgezet naar een well-known-text serialisatie in het GeoSPARQL vocabulaire voor verwerking in de semantische store. De temporele component is beschreven volgens [PURL](http://purl.org/dc/elements/1.1/date) en als xsd:date geserialiseerd. De thematische component tenslotte bestaat uit SKOS-concepten die molentypen beschrijven - voor zover bij de auteur bekend is deze termenlijst niet in een concept-classificatie gevat. 

De tweede dataset bestond uit de Beeldbank Zeeland, gehost door Bibliotheek.nl op [datalab/bbz](http://datalab.bibliotheek.nl/pubby/page/bbz/) bestaande uit meer dan 162.000 beelden die eveneens gehost worden door Picturae. De geografische component was als indirecte (omschreven) aanduidingen opgenomen als [PURL/coverage](http://purl.org/dc/terms/coverage) - er waren in eerste instantie dus geen directe coördinaten beschikbaar. Deze plaatsaanduidingen zijn gegeocodeerd met behulp van de GeoNames webservice. Het service-level van GeoNames viel opvallend genoeg nogal tegen: GeoNames vereist exact omschreven plaatsaanduidingen en tolereert hierin geen verschrijvingen. Er zijn daardoor nogal wat beelden niet gegeocodeerd - slechts de beelden die eenvoudig met GeoNames te geocoderen vielen. Naar later bleek, is de PDOK geocodeer-service beter en fout-toleranter, helaas biedt deze dan weer geen URI’s voor de geleverde plaatsaanduidingen. De temporele component van de Beeldbank Zeeland bestond uit [PURL/date](http://purl.org/dc/terms/date) aanduidingen. De onderwerpen in de dataset zijn beschreven in domein-eigen URI’s zoals [datalab/Socialegeschiedenis](http://datalab.bibliotheek.nl/pubby/bbz/Socialegeschiedenis), maar deze zijn gelinkt met termen uit de Getty Arts & Architecture Thesaurus. 

##Backend

De server bestaat uit gebruikelijke http-hosting services ([Apache](https://httpd.apache.org/)) gecombineerd met de Development-versie van [Virtuoso](https://github.com/openlink/virtuoso-opensource) Open Source van OpenLink, één van de marktleiders op het gebied van semantische technologie. De keus was hierop gevallen aangezien de development-opensource versie van dit product ruime ondersteuning op alle thematische, temporele en geografische fronten bood, gecombineerd met veel nadruk op performance. Het product heeft niet teleurgesteld, ondanks dat er weinig aan performance-tuning is gedaan. 

Aangezien alle semantische, geografische en temporele functionaliteit is ingebouwd in Virtuoso, was er geen noodzaak voor de installatie van middle ware of service bussen. Het voordeel hiervan was dat er weinig beheer op servercomponenten nodig was en meer aandacht kon worden geschonken aan de ontwikkeling van de front end functionaliteit. Keerzijde hiervan is dat de toepassing momenteel enkel met Virtuoso Open Source 7.1+ als back end werkt.

##Frontend

De web-toepassing is voor het overgrote deel gebaseerd op de moderne JavaScript frameworks [OpenLayers 3](http://ol3js.org/), [AngularJs](https://angularjs.org/) en [D3.js](http://d3js.org/). Ieder van deze frameworks biedt uitgebreide mogelijkheden ter ondersteuning van de geografische (OpenLayers), temporele (D3) en thematische (Angular) aspecten van het prototype. 

AngularJs is als MVC gekozen om goede data-binding eigenschappen met interactie-elementen te verzorgen en front-end filtering toe te passen. D3.Js verzorgt de temporele visualisatie en gebruikersinteractie in een tijdbalk onder de resultaatset.

##Installatie-instructies

0. Clone de repository. Deze bevat import scripts en de javascript applicatie.
1. Installeer & configureer virtuoso, vanaf de [github repository](https://github.com/openlink/virtuoso-opensource)
2. Open de Virtuoso command line interface en importeer data in virtuoso met behulp van de bulk loader - een handleiding vind je [hier](http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VirtBulkRDFLoader) en een korte uitleg (hier)[http://www.pilod.nl/wiki/Virtuoso_bulk_loader]. Doe geen pogingen de data te importeren via de web-interface (conductor) - deze biedt onvoldoende ondersteuning voor grote(re) bestanden. Kies voor bestanden met geometrieën gecodeerd in GeoSPARQL well-known text format, en data geformatteerd als xsd:date.
3. Configureer de erfgeoviewer javascript applicatie zodat deze verwijst naar de virtuoso server: pas hiervoor de configuration.js aan. 
4. Configureer de erfgeoviewer javascript applicatie zodat de SPARQL queries de data correct bevragen die in je Virtuoso-installatie zitten: pas hiervoor de configuration.js aan. 
5. Het kan nodig zijn CORS headers te bieden voor je virtuoso server: volg hiervoor [deze aanwijzingen](http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VirtTipsAndTricksCORsEnableSPARQLURLs).
6. Deploy de javascript op een locatie die door Apache2 web server wordt geserveerd
