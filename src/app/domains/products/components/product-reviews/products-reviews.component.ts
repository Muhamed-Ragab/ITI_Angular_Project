import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Review } from '../../dto';

@Component({
  selector: 'app-product-reviews',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="mt-5">
      <h5 class="fw-bold mb-4">
        <i class="bi bi-chat-left-text me-2"></i>
        Customer Reviews ({{ reviews().length }})
      </h5>

      <!-- Review List -->
      @for (review of reviews(); track review.id) {
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <span class="fw-semibold">{{ review.user.name }}</span>
                @if (review.user.verified_purchase) {
                  <span class="badge bg-success ms-2 small">Verified Purchase</span>
                }
              </div>
              <small class="text-muted">{{ review.createdAt | date:'mediumDate' }}</small>
            </div>

            <!-- Stars -->
            <div class="my-1">
              @for (star of [1,2,3,4,5]; track star) {
                <i class="bi small"
                  [class.bi-star-fill]="star <= review.rating"
                  [class.bi-star]="star > review.rating"
                  [class.text-warning]="star <= review.rating"
                  [class.text-muted]="star > review.rating">
                </i>
              }
            </div>

            <p class="mb-0 text-muted">{{ review.comment }}</p>
          </div>
        </div>
      }

      @if (reviews().length === 0) {
        <p class="text-muted">No reviews yet. Be the first to review!</p>
      }

      <!-- Submit Review Form -->
      <div class="card border-0 shadow-sm mt-4">
        <div class="card-body">
          <h6 class="fw-bold mb-3">Write a Review</h6>

          <!-- Rating Picker -->
          <div class="mb-3">
            <label class="form-label small fw-semibold">Rating</label>
            <div class="d-flex gap-1">
              @for (star of [1,2,3,4,5]; track star) {
                <i class="bi fs-4 cursor-pointer"
                  [class.bi-star-fill]="star <= newRating()"
                  [class.bi-star]="star > newRating()"
                  [class.text-warning]="star <= newRating()"
                  [class.text-muted]="star > newRating()"
                  style="cursor: pointer;"
                  (click)="newRating.set(star)">
                </i>
              }
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold">Comment</label>
            <textarea
              class="form-control"
              rows="3"
              placeholder="Share your experience..."
              [ngModel]="newComment()"
              (ngModelChange)="newComment.set($event)"
              name="comment"
            ></textarea>
          </div>

          <button
            class="btn btn-primary"
            [disabled]="newRating() === 0 || !newComment()"
            (click)="submitReview()"
          >
            <i class="bi bi-send me-2"></i>Submit Review
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductReviewsComponent {
  readonly reviews = input<Review[]>([]);
  readonly reviewSubmit = output<{ rating: number; comment: string }>();

  readonly newRating = signal(0);
  readonly newComment = signal('');

  submitReview(): void {
    if (this.newRating() === 0 || !this.newComment()) return;
    this.reviewSubmit.emit({
      rating: this.newRating(),
      comment: this.newComment(),
    });
    // Reset form
    this.newRating.set(0);
    this.newComment.set('');
  }
}