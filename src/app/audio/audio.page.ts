import { NewapiService } from './../newapi.service';
import { async } from '@angular/core/testing';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { Storage } from '@ionic/storage';
import { track } from '../model/track';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController, IonContent } from '@ionic/angular';
import { chapter } from '../model/chapter';
//import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Downloader, DownloadRequest, NotificationVisibility } from '@ionic-native/downloader/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { AutoloadService } from '../service/autoload.service';
const MEDIA_FOLDER_NAME = 'audios';
import { Plugins } from '@capacitor/core';
const { CapacitorMusicControls , Share } = Plugins;

@Component({
  selector: 'app-audio',
  templateUrl: './audio.page.html',
  styleUrls: ['./audio.page.scss'],
})
export class AudioPage implements OnInit {

  jsonaudio = '/assets/audios.json';
  constructor(
    private transfer: FileTransfer,
    private file: File,
    private downloader: Downloader,
    public loadingController: LoadingController,
   // public socialSharing: SocialSharing,
    public toastController: ToastController,
    public api: ApiService,
    public _api: NewapiService,
    public storage: Storage,
    public route: ActivatedRoute,
    public router: Router,
    public _autoload : AutoloadService
    ) {
      _autoload.activetrack.subscribe(val=>{
        _autoload.activetrack.subscribe(val=>{
        this.ckfev();
      })
    })
  }
  data = null;
  //playlist : track[] = this.route.snapshot.data['audios'];
  playlist: track[] ;//= this.route.snapshot.data['audios'];
  favourit = [];
  chapter = this.route.snapshot.paramMap.get('id');
  chapterdata: chapter;
  defaultImage = '/assets/loader.gif';
  files = []
  ngOnInit() {
    /*  this.storage.get('allaudios').then((values:track[])=>{
        if(values)
        {
        this.playlist = values.filter(list => list.id === this.chapter )
        }
      }).then(()=>{
        this.ckfev();
        this.jsonaudiofun()
      })  */
    }
      ionViewWillEnter(){

    this.storage.get('chapters').then((values: chapter[]) => {
      if (values) {
        this.chapterdata = values.filter(list => list.id === this.chapter)[0]
        //console.log(this.chapterdata)
      }
    })
    this._api.audio("?chapter_id="+this.chapter).subscribe(val=>{
      this.playlist = val;
    })

    this.ckfev();
    this.jsonaudiofun()
    this.dqlist()
  }
  jsonaudiofun() {
    if (this.playlist.length < 1) {
      this.api.localaudio().subscribe(values => {
        this.playlist = values.filter(list => list.id === this.chapter)
      })
    }
  }
  addfavouriteAudio(track: track) {
    this.storage.get('favourite').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.url != track.url);
        if (Array.isArray(filteredPeople)) {
          this.favourit = filteredPeople;
          this.favourit.push(track)
          this.storage.set('favourite', this.favourit).then(() => { this.presentToast(); this.ckfev() })
        }
        else {
          this.storage.set('favourite', [track]).then(() => { this.presentToast(); this.ckfev() })
        }
      }
      else {
        this.storage.set('favourite', [track]).then(() => { this.presentToast(); this.ckfev() })
      }
    })
  }

  removefavouriteAudio(track) {
    this.storage.get('favourite').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.url != track.url);
        if (Array.isArray(filteredPeople)) {
          this.storage.set('favourite', filteredPeople).then(() => { this.ckfev() })
        }
        else {
          this.storage.set('favourite', []).then(() => { this.ckfev() })
        }
      }
      else {
        this.storage.set('favourite', []).then(() => { this.ckfev() })
      }
    })
  }

  play(data) {
    this.api.playnextchapternext(true)
    this.api.playnonext(data)
    this.api.audiolistnext(this.playlist)
    if(!this.api.showplayerinnext.value)
    {
    this.api.showplayernext(false)
    //this.router.navigate(['/tab/home/play'])
    }else
    {
      this.api.showplayernext(true)
    }
  }
  searchfocus() {
    this.router.navigate(['/tab/search'])
  }

  ckfev() {
    this.storage.get('favourite').then((val: track[]) => {
      if (Array.isArray(val)) {
        this.favourit = val
        for (var i = 0; i < this.playlist.length; i++) {
          if (val.filter(e => e.url === this.playlist[i].url).length > 0) {
            this.playlist[i].fav = true;
          } else {
            this.playlist[i].fav = false;
          }
        }
      }

    })
    this.downloadingck()
  }

  ///// downloading ck
  downloadingck() {
    this.downloadgck()
    this.storage.get('downloadq').then((val: track[]) => {
      if(val)
      {
      if (Array.isArray(val)) {
        this.favourit = val
        for (var i = 0; i < this.playlist.length; i++) {
          if (val.filter(e => e.url === this.playlist[i].url).length > 0) {
            this.playlist[i].downloading = true;
          } else {
            this.playlist[i].downloading = false;
          }
        }
      }
      console.log('downloading play',this.playlist)

    }
    })

  }
  ///// downloaded ck
  downloadgck() {
    this.storage.get('download').then((val: track[]) => {
      if(val){
      if (Array.isArray(val)) {
        this.favourit = val
        for (var i = 0; i < this.playlist.length; i++) {
          if (val.filter(e => e.id === this.playlist[i].id).length > 0) {
            this.playlist[i].downloaded = true;
            this.playlist[i].downloading = false;
          } else {
            this.playlist[i].downloaded = false;
            this.playlist[i].downloading = false;
          }
        }
      }
      console.log('download play',this.playlist)
    }
    })
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Audio marked as favourite.',
      duration: 1500
    });
    toast.present();
  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      duration: 4000,
      message: 'Loading.',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

async  shareaudio(msg, img, url) {
    let ccc = "To listen more files from " + msg + " download Islamic Audio Books app https://play.google.com/store/apps/details?id=com.urduaudiobooks.urdutafsir&hl=en or visit www.islamicaudiobooks.info " + url
    this.presentLoadingWithOptions();
    //this.socialSharing.share(ccc, 'Islamic Audio Book').then(() => {
  //  })
  await Share.share({
    title: 'Islamin Audio Book',
    text: 'Download Islamic Audio Books app https://play.google.com/store/apps/details?id=com.urduaudiobooks.urdutafsir&hl=en or visit www.islamicaudiobooks.info to listen to free Islamic Audio Books',
    dialogTitle: 'Share with buddies'
  });

  }
  getColor(book: track) {
    return book.color;
  }

  download(a) {
    a.download = 1;
    let str = a.url.split("/");
    let vv = str.slice(-1).pop();

    const fileTransfer: FileTransferObject = this.transfer.create();

    const url = a.url;
    fileTransfer.download(url, this.file.dataDirectory + vv).then((entry) => {
     // alert('download complete: ' + entry.toURL());
      this.copyfile(a, entry.toURL())
      // a.url = vv;
      // this.storehistory(a);
    }, (error) => {
      // handle error
    });

  }

  copyfile(track, fullPath) {
    //console.log('copy now to ' + fullPath)
    var myPath = fullPath;
    if (fullPath.indexOf('file://') < 0) {
      myPath = 'file://' + fullPath;
    }

    const ext = myPath.split('.').pop();
    const d = Date.now();
    let str = track.url.split("/");
    let newName = str.slice(-1).pop();

    const name = myPath.substr(myPath.lastIndexOf('/') + 1);
    const copyFrom = myPath.substr(0, myPath.lastIndexOf('/') + 1);
    const copyTo = this.file.dataDirectory + MEDIA_FOLDER_NAME;

    this.file.copyFile(copyFrom, name, copyTo, newName).then(
      success => {
        //console.log(success)
        this.loadFiles();
        track.location = success;
        track.url = "/" + MEDIA_FOLDER_NAME + '/' + newName;
       // alert(copyTo + newName);
        this.storehistory(track);
      },
      error => {
        //console.log('error: ', error);
      }
    );
  }

  getindque(track) {
    if(this.downloadQlist)
    {
    const filteredPeople = this.downloadQlist.filter((item) => item.id === track.id);
    ////console.log(track.id, filteredPeople, 'okl')
    if (filteredPeople.length > 0) {
      return true;
    } else {
      return false;
    }
   }

  }

  storehistory(track) {
    //console.log('down')
    //console.log(track)
    this.storage.get('download').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.url != track.url);
        if (Array.isArray(filteredPeople)) {
          this.favourit = filteredPeople;
          this.favourit.push(track)
          this.storage.set('download', this.favourit)
          //console.log('down1')
          this.getindque(track)
          this.ckfev();

        }
        else {
          this.storage.set('download', [track])
          //console.log('down2')
          this.getindque(track)
          this.ckfev();

        }
      }
      else {
        //console.log('down3')
        this.storage.set('download', [track])
        this.getindque(track)
        this.ckfev();
      }
    })
  }
  loadFiles() {
    this.file.listDir(this.file.dataDirectory, MEDIA_FOLDER_NAME).then(
      res => {
        this.files = res;
        //console.log(this.files)
      },
      err =>{} //console.log('error loading files: ', err)
    );
  }
  downloadAll() {
    let track = this.playlist
    this.storage.get('downloadq').then((val: track[]) => {
      if (Array.isArray(val)) {
        const filteredPeople = val;
        if (Array.isArray(filteredPeople)) {
          this.favourit = filteredPeople;
          this.favourit.concat(track);
          let primes = this.favourit.concat(this.playlist);
         console.log(primes)
         // this.storage.set('download', primes)
          this.storage.set('downloadq', primes)
          .then(()=>{
            this.ckfev();
          })
        }
        else {
          this.storage.set('downloadq', track)
          .then(()=>{
            this.ckfev();
          })
        }
      }
      else {
        this.storage.set('downloadq', track)
        .then(()=>{
          this.ckfev();
        })
       }
    })
  }

  /// add in downloadq
  downloadQ(track: track) {
    this.storage.get('downloadq').then((val: track[]) => {

      if (Array.isArray(val)) {
        const filteredPeople = val.filter((item) => item.url != track.url);
        if (Array.isArray(filteredPeople)) {
          this.favourit = filteredPeople;
          this.favourit.push(track)
          //console.log(this.favourit)
          this.storage.set('downloadq', this.favourit).then(() => {
            this.ckfev();

          })
        }
        else {
          this.storage.set('downloadq', [track]).then(() => {
            this.ckfev();

           })
        }
      }
      else {
        this.storage.set('downloadq', [track]).then(() => {
          this.ckfev();
        })
      }
    })
    this.api.downloadQstartnext(track.id);
    this.dqlist()
  }

  downloadQlist = []
  dqlist() {
    this.storage.get('downloadq').then((val: track[]) => {
      this.downloadQlist = val;
    })
  }

  @ViewChild(IonContent,{static: false}) ionContent: IonContent;
  showscrolltotop : boolean = false;
  scrollContent() {
      this.ionContent.scrollToTop(300); //300 for animate the scroll effect.
  }
  scroll(event)
  {
    if (event.detail.deltaY > 0) {
      this.showscrolltotop = true;
    } else {
      this.showscrolltotop = true;
    };
  }

}
