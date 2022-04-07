import { Component, OnInit } from '@angular/core';
import { FirebaseDynamicLinks } from '@ionic-native/firebase-dynamic-links/ngx';
import { Geolocation } from '@capacitor/geolocation';

import { NewapiService } from '../newapi.service';
import {  Router } from '@angular/router';


@Component({
  selector: 'app-checkpermission',
  templateUrl: './checkpermission.page.html',
  styleUrls: ['./checkpermission.page.scss'],
})
export class CheckpermissionPage implements OnInit {

  currentLocation = null;
  permition = null;

  constructor(private _api: NewapiService, private router: Router) { }

  ngOnInit() {
    this.devicekCurrentLocation()
  }
  async devicekCurrentLocation() {

    let status = await Geolocation.checkPermissions();
   if(status)
   {
    this.currentLocation = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 1000
      });
      this._api.currentLocationLatNext(this.currentLocation.coords.latitude);
      this._api.currentLocationLongNext(this.currentLocation.coords.longitude);
      this.router.navigate(['tab/home/landing'], { replaceUrl: true })
    }else{
      await Geolocation.requestPermissions();
    }

  }
 async retry(){
      this.devicekCurrentLocation();
  }
}