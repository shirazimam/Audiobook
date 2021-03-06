import { track } from './../model/track';
import { PlaynewmediaService } from './playnewmedia.service';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { ToastController } from '@ionic/angular';
import { Downloader, DownloadRequest } from '@ionic-native/downloader/ngx';
const MEDIA_FOLDER_NAME = 'audios';
@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor( public toastController : ToastController, public storage : Storage, public transfer : FileTransfer, public file : File,private downloader: Downloader, public _playmedia : PlaynewmediaService) {
  }
  waitingtime = 320;
  interval ;
  /// tracking downloading pause time and restart download
  trackingwaittime()
  {
   this.interval = setInterval(() => {
      if(this.waitingtime > 0)
      {
       this.waitingtime = this.waitingtime-1;
      }
      else
      {
        this.downloadingStatus  = false;
        clearInterval(this.interval)
        this.waitingtime = 320;
        this.trackingwaittime()
      }
     }, 1000);
  }
  /// start download
  start()
  {
    this.trackingwaittime();
    setInterval(() => {
      console.log('download triger');
      this.qdownload()
    }, 10000);
  }

  set_interval;
  downloadingStatus : boolean = false;
  favourit;

  ///  download q checking and downloading status

  qdownload() {
    this.storage.get('downloadq').then((val: track[]) => {
      if (val) {

        if(!this.downloadingStatus)
        {
        console.log(val[0], 'download Started');
        this.download(val[0])
        }
      } else {
        //clearInterval(this.set_interval)
      }
    })
  }

  /// main downloading function using cordova plugin
  download(a) {
    if(a)
    {

     var track = a;
    this.downloadingStatus = true;
    a.download = 1;
    let str = a.url.split("/");
    let vv = str.slice(-1).pop();
    const fileTransfer: FileTransferObject = this.transfer.create();
    const url = a.url;
    this.presentToast('Downloading '+a.audioname);
  /*  fileTransfer.download(url, this.file.dataDirectory + vv).then((entry) => {
      console.log('download complete: ' + entry.toURL());
      this.copyfile(a, entry.toURL())
    }, (error) => {
      this.removefromdownloadQ(a)
      this.downloadingStatus = false;
      console.log("Download Error",error);
    });
*/


    var request: DownloadRequest = {
      uri: url,
      title: vv,
      description: '',
      mimeType: 'audio/mp3',
      visibleInDownloadsUi: true,
      notificationVisibility: 1,
    //  destinationInExternalFilesDir
      destinationInExternalPublicDir: {
          dirType: 'Downloads',
          subPath: 'islaminAudio/'+vv+'.mp3'
      }
  };


this.downloader.download(request)
          .then((location: string) =>{
          console.log('File downloaded at:'+location);
          track.downloadedurl = location;
          console.log("track",track)
          this.storedownloadhistort(track);
        })
          .catch((error: any) => console.error(error));
  }
  }
  /// tracking downloaded file location and copy into app for playing in local

  copyfile(track, fullPath) {
    console.log('copy now to ' + fullPath)
    var myPath = fullPath;
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }
    let str = track.url.split("/");
    let newName = str.slice(-1).pop();

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;

    this.file.copyFile(copyFrom, name, copyTo, newName).then(
      success => {
        track.location = success;
        track.fullpath = fullPath;
        console.log("CopySuccess");
        track.url = "/" + MEDIA_FOLDER_NAME + '/' + newName;
        this.storedownloadhistort(track);
      },
      error => {
        console.log('Copy error: ', error);
        this.removefromdownloadQ(track)
        this.downloadingStatus = false;
      }
    );
  }

  //// store record in down loading  list for later use
  storedownloadhistort(track) {
    console.log('down')
    console.log(track)
    this.storage.get('download').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.url != track.url);
        if (Array.isArray(filteredPeople)) {
          this.favourit = filteredPeople;
          this.favourit.push(track)
          this.storage.set('download', this.favourit)
          console.log('Store Success 1');
          this.presentToast('Downloading completed '+track.audioname);

          this.removefromdownloadQ(track);
        }
        else {
          this.presentToast('Downloading completed '+track.audioname);
          this.storage.set('download', [track])
          console.log('Store Success 2')
          this.removefromdownloadQ(track);
        }
      }
      else {
        this.presentToast('Downloading completed '+track.audioname);
        this.storage.set('download', [track])
        console.log('Store Success 3')
        this.removefromdownloadQ(track);
      }
    })
  }
  //// remove file from download Q

  removefromdownloadQ(track: track) {
   // alert("q list");
    this.storage.get('downloadq').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.id != track.id);
        console.log(track, filteredPeople);
        if (Array.isArray(filteredPeople)) {
          this.storage.set('downloadq', filteredPeople).then(() => { })
          console.log("Removed")
          this.downloadingStatus = false;

          clearInterval(this.interval)
          this.waitingtime = 320;
          this.trackingwaittime()
        }
        else {
          this.storage.set('downloadq', []).then(() => { })
          this.downloadingStatus = false;
          clearInterval(this.interval)
          this.waitingtime = 320;
          this.trackingwaittime()
        }
      }
      else {
        this.storage.set('downloadq', []).then(() => { })
        this.downloadingStatus = false;
        clearInterval(this.interval)
        this.waitingtime = 320;
        this.trackingwaittime()
    }
    })
  }
  /// toaster for downloading status

  async presentToast(message) {
    const toast = await this.toastController.create({
      position: 'top',
      message: message,
      duration: 2000
    });
    toast.present();
  }

}
