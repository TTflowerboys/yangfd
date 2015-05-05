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
#import <UIView+BBT.h>
#import "UIImageView+Assets.h"
#import <NSArray+ObjectiveSugar.h>

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

    [self removeAllSubViews];

    [imagesArray eachWithIndex:^(NSString *object, NSUInteger index) {
        UIImageView *imageView = [[UIImageView alloc] init];
        imageView.contentMode = UIViewContentModeScaleAspectFill;
        imageView.clipsToBounds = YES;
        [imageView setImageWithAssetURL:[NSURL URLWithString:object]];
        imageView.tag = index;
        [self addSubview:imageView];

        //self.userInteractionEnabled = YES;
        if (self.imageTapEnabled) {
            imageView.userInteractionEnabled = YES;
            UITapGestureRecognizer *tapped = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(imageTapped:)];
            [imageView addGestureRecognizer:tapped];
        }

    }];
}

- (void)imageTapped:(UITapGestureRecognizer *)sender {
    if (_scrollImageDelegate && [_scrollImageDelegate respondsToSelector:@selector(scrollView:didTapImageAtIndex:)]) {
        UIImageView *view = (UIImageView *)[sender view];
        [_scrollImageDelegate scrollView:self didTapImageAtIndex:view.tag];
    }
}

- (void)layoutSubviews {
    [super layoutSubviews];
    NSArray *subViews = [self subviews];
    [subViews each:^(UIView *view) {
        view.frame = CGRectMake(view.tag * self.frame.size.width, 0, self.frame.size.width, self.frame.size.height);
    }];
    [self setContentSize:CGSizeMake([subViews count] * self.frame.size.width, [self bounds].size.height)];
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
