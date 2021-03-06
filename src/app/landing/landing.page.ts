import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, ActivatedRoute, Event, NavigationStart, NavigationEnd } from '@angular/router';
import { Storage } from '@ionic/storage';
import { track } from '../model/track';
import { Platform, ToastController, IonContent } from '@ionic/angular';
import { MusicControls } from '@ionic-native/music-controls/ngx';
import { Network } from '@ionic-native/network/ngx';
import { book } from '../model/book';
import { NewapiService } from '../newapi.service';
import { timeout } from 'rxjs/operators';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrls: ['./landing.page.scss'],
})
export class LandingPage implements OnInit {


  constructor(
    public route: ActivatedRoute,
    public toastCtrl: ToastController,
    public api: NewapiService,
    public _api: ApiService,
    public router: Router,
    public storage: Storage,
    private platform: Platform,
    public musicControls: MusicControls,
    // public network: Network
  ) {

  }
  @ViewChild(IonContent, { static: false }) ionContent: IonContent;

  slideOpts = {
    initialSlide: 1,
    speed: 400,
    spaceBetween: -46,
    watchSlidesProgress: true,
    slidesPerView: 1,
    slidesPerColumn: 1,
    autoplay: {
      delay: 4000,
    },
  };
  slideOpts2 = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: -25,
    slidesPerView: 2,
    ionSlidePrevStart: true,
  };
  slideOpts3 = {
    initialSlide: 0,
    speed: 400,
    spaceBetween: 10,
    slidesPerView: 4,
    ionSlidePrevStart: true,
  };

  data = [];//this.route.snapshot.data['module'];;
  sliders = []//this.route.snapshot.data['slider'];
  books: book[] = [];
  taudiodata = this.route.snapshot.data['trandingaudio'];

  lastlist: track[] = [];
  activetrack: track;
  defaultImage = '/assets/loader.gif';
  defaultImageslide = '/assets/sliderimg.png';

  dailyaskar: track[] = []

  playslideraudio(id) {
    if (typeof id != undefined || id != '') {
      this.api.audio('?a_id=' + id).subscribe(val => {
        this._api.playnextchapternext(false)
        this._api.audiolistnext(val)
        this._api.playnonext(0)
        this._api.showplayernext(true)
      })
    }
    this.storage.remove('audioid');

  }
  getColor(book: track) {
    return book.color;
  }

  playpushaudio(){
    this.storage.get('audioid').then(val=>{
      if(val){
      this.playslideraudio(val)
      }
    })
  }

  ngOnInit() {
    this._api.dailyazkar().subscribe(val => {
      this.dailyaskar = val;
    })
    this.storage.get('allbooks').then((val: book[]) => {
      this.books = val;
    })/*.then(() => { */
    this.storage.get('allmodule').then(val => {
      this.data = val
    })
    this.storage.get('allslider').then(val => {
      this.sliders = val
    })
    this.storage.get('trandingaudio').then(val => {
      this.taudiodata = val
    })

    //})




  }
  searchfocus() {
    // this.router.navigate(['/tab/search'])
  }
  play(track) {
    this._api.playnonext(0)
    this._api.audiolistnext([track])
    this.router.navigate(['/tab/home/play'])
  }
  palylast(i) {
    this._api.audiolistnext(this.lastlist)
    this._api.playnonext(i)
    this._api.showplayernext(true)
  }
  trandingpalylast(i) {
    this._api.playnextchapternext(false)
    this._api.audiolistnext(this.taudiodata)
    this._api.playnonext(i)
    this._api.showplayernext(true)
  }
  dailyaskarlist(i) {
    this._api.playnextchapternext(false)
    this._api.audiolistnext(this.dailyaskar)
    this._api.playnonext(i)
    this._api.showplayernext(true)
  }
  doRefresh(e) {
    this._api.slider().subscribe(data => {
      // this.sliders = data;
      e.target.complete();
    })
  }
  ionViewDidEnter() {
    this.ionContent.scrollToTop(3);
    this.storage.get('history').then(val => {
      this.lastlist = val.reverse();
    }).then(() => {
      this.storage.get('lasttrack').then(val => {
        this.activetrack = val
      })
    })
    setTimeout(() => {
      this.playpushaudio()
    }, 1000);

  }


  /// book url

  urllink(module) {
    this.storage.get('allbooks').then((values: book[]) => {
      if (values) {
        const playlist = values.filter(list => list.modules.toLowerCase().indexOf(module.toLowerCase()) !== -1)
        if (playlist.length == 1) {
          this.router.navigate(['/tab/home/chapter/',playlist[0].id])
          //this.router.navigate(['tab/home/book/', module])

        } else {
          this.router.navigate(['tab/home/book/', module])
        }
      }
    })
  }

}
