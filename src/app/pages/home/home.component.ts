import { Component, ElementRef, HostListener, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { RegistroSupabaseService, ProspectoPayload } from '../../services/registro-supabase.service';
import { HomeContentService, HomeContent, VideoItem } from '../../services/home-content.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly registroService = inject(RegistroSupabaseService);
  private readonly contentService = inject(HomeContentService);
  private readonly sanitizer = inject(DomSanitizer);

  @ViewChild('videoFrame') videoFrameRef?: ElementRef<HTMLDivElement>;

  loading = signal(false);
  success = signal('');
  error = signal('');

  content = signal<HomeContent | null>(null);
  activePromo = signal(0);

  activeVideo = signal<VideoItem | null>(null);
  activeVideoUrl = signal<SafeResourceUrl | null>(null);
  isDirectVideo = signal(false);
  isFullscreen = signal(false);

  formData: ProspectoPayload = {
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  };

  ngOnInit(): void {
    this.contentService.getContent().subscribe(data => {
      this.content.set(data);
    });
  }

  setActivePromo(index: number): void {
    this.activePromo.set(index);
  }

  openVideo(video: VideoItem): void {
    const direct = /\.(mp4|webm|ogg)$/i.test(video.videoUrl);
    this.isDirectVideo.set(direct);

    if (!direct) {
      this.activeVideoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(video.videoUrl + '?autoplay=1'));
    } else {
      this.activeVideoUrl.set(null);
    }

    this.activeVideo.set(video);
    document.body.style.overflow = 'hidden';
  }

  closeVideo(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    }
    this.activeVideo.set(null);
    this.activeVideoUrl.set(null);
    document.body.style.overflow = '';
  }

  toggleFullscreen(): void {
    const el = this.videoFrameRef?.nativeElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      const req = el.requestFullscreen
        || (el as any).webkitRequestFullscreen
        || (el as any).msRequestFullscreen;
      req?.call(el);
    } else {
      this.exitFullscreen();
    }
  }

  private exitFullscreen(): void {
    const exit = document.exitFullscreen
      || (document as any).webkitExitFullscreen
      || (document as any).msExitFullscreen;
    exit?.call(document);
  }

  @HostListener('document:fullscreenchange')
  @HostListener('document:webkitfullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen.set(!!document.fullscreenElement);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.activeVideo() && !this.isFullscreen()) {
      this.closeVideo();
    }
  }

  async submitForm(): Promise<void> {
    this.error.set('');
    this.success.set('');

    if (!this.formData.nombre.trim() || !this.formData.email.trim() || !this.formData.telefono.trim()) {
      this.error.set('Completa nombre, correo y teléfono.');
      return;
    }

    this.loading.set(true);

    this.registroService.guardarProspecto(this.formData).subscribe({
      next: ok => {
        this.loading.set(false);

        if (!ok) {
          this.error.set('No se pudo enviar el registro.');
          return;
        }

        this.success.set('Registro enviado correctamente.');
        this.formData = {
          nombre: '',
          email: '',
          telefono: '',
          mensaje: ''
        };
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo enviar el registro.');
      }
    });
  }
}