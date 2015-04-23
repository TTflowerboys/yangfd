//
//  TICScrollImageView.m
//  TheIndiCard
//
//  Created by Andy on 14-6-25.
//  Copyright (c) 2014年 BBT. All rights reserved.
//

#import "BBTScrollImageView.h"
#import <UIImageView+AFNetworking.h>
#import <BBTCommonMacro.h>

@implementation BBTScrollImageView
@synthesize scrollImageDelegate = _scrollImageDelegate;

- (id)initWithFrame:(CGRect)frame
{
    self = [super initWithFrame:frame];
    if (self) {
        // Initialization code
        self.backgroundColor = [UIColor whiteColor];
        [self setClipsToBounds:YES];
		self.showsHorizontalScrollIndicator = self.showsVerticalScrollIndicator = NO;
		self.pagingEnabled = YES;
    }
    return self;
}

- (void)setImages:(NSArray *)imagesArray {
    CGFloat curXLoc = 0;
	if ([imagesArray count] >= 1) {
		NSUInteger i;
		for (i = 1; i <= [imagesArray count]; i++) {
			UIImageView *imageView = [[UIImageView alloc] init];
			imageView.contentMode = UIViewContentModeScaleAspectFill;
            imageView.clipsToBounds = YES;
            NSInteger index = i - 1;
            id imageItem = [imagesArray objectAtIndex:index];
            if (!IsNilNullOrEmpty(imageItem) && [imageItem isKindOfClass:[NSString class]])
            {
                [imageView setImageWithURL:[NSURL URLWithString:imageItem] placeholderImage:nil];
            }
            else if ([imageItem isKindOfClass:[UIImage class]])
            {
                [imageView setImage:imageItem];
            }

			CGRect rect = imageView.frame;
			rect.size = CGSizeMake(self.frame.size.width, self.frame.size.height);
			rect.origin = CGPointMake(curXLoc, 0);
			curXLoc += self.frame.size.width;
			imageView.frame = rect;
			imageView.tag = index;
			[self addSubview:imageView];
            
            self.userInteractionEnabled = YES;
            imageView.userInteractionEnabled = YES;
			UITapGestureRecognizer *tapped = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(imageTapped:)];
			[imageView addGestureRecognizer:tapped];
		    [self setContentSize:CGSizeMake([imagesArray count] * self.frame.size.width, [self bounds].size.height)];
        }
	}
}

- (void)imageTapped:(UITapGestureRecognizer *)sender {
    if (_scrollImageDelegate && [_scrollImageDelegate respondsToSelector:@selector(scrollView:didTapImageAtIndex:)]) {
        UIImageView *view = (UIImageView *)[sender view];
        [_scrollImageDelegate scrollView:self didTapImageAtIndex:view.tag];
    }
}

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect
{
    // Drawing code
}
*/

@end
