//
//  CUTESplashViewController.m
//  currant
//
//  Created by Foster Yin on 5/16/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import "CUTESplashViewController.h"
#import "BBTPagingView.h"
#import "MasonryMake.h"
#import "CUTECommonMacro.h"
#import "BBTCenterImageView.h"
#import "CUTEUIMacro.h"


#define kPageIndicatorHeight 14
#define kPageIndicatorBottomMargin 22
#define kButtonHeight 30
#define kButtonTopMargin 28
#define kButtonBetweenMargin 10
#define kButtonHorizontalMargin 50
#define kButtonBottomMargin 40


#define kPageCount 3

@interface CUTESplashViewController () <BBTPagingViewViewDelegate, BBTPagingViewViewDataSource> {

    BBTPagingView *_pagingView;

    UIButton *_enterButton;

    UIButton *_applyBetaButton;

    UIPageControl *_pageIndicator;

    NSTimer *_timer;
}

@end

@implementation CUTESplashViewController

- (void)viewDidLoad {
    [super viewDidLoad];

    self.view.backgroundColor = HEXCOLOR(0xf0e8d4, 1);
    _pagingView = [[BBTPagingView alloc] initWithFrame:self.view.bounds];
    _pagingView.delegate = self;
    _pagingView.dateSource = self;
    [self.view addSubview:_pagingView];

    _pageIndicator = [[UIPageControl alloc] init];
    _pageIndicator.frame = CGRectMake(0, RectHeightExclude(self.view.bounds, (kButtonHeight + kButtonBottomMargin + kPageIndicatorBottomMargin)), RectWidth(self.view.bounds), kPageIndicatorHeight);
    _pageIndicator.pageIndicatorTintColor = HEXCOLOR(0xcccccc, 1);
    _pageIndicator.currentPageIndicatorTintColor = CUTE_MAIN_COLOR;
    [self.view addSubview:_pageIndicator];
    _pageIndicator.numberOfPages = kPageCount;

    _enterButton = [UIButton buttonWithType:UIButtonTypeCustom];
    _enterButton.frame = CGRectMake(kButtonHorizontalMargin, RectHeightExclude(self.view.bounds, (kButtonHeight + kButtonBottomMargin)), RectWidthExclude(self.view.bounds, kButtonHorizontalMargin * 2), kButtonHeight);
    [_enterButton setTitleColor:CUTE_MAIN_COLOR forState:UIControlStateNormal];
    [_enterButton setTitle:STR(@"有邀请码？进入应用") forState:UIControlStateNormal];
    _enterButton.titleLabel.font = [UIFont systemFontOfSize:14];
    _enterButton.layer.borderColor = CUTE_MAIN_COLOR.CGColor;
    _enterButton.layer.borderWidth = 1;
    _enterButton.layer.cornerRadius = 6;
    [self.view addSubview:_enterButton];
    [_enterButton addTarget:self action:@selector(onEnterButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [_enterButton setHidden:YES];

    _applyBetaButton = [UIButton buttonWithType:UIButtonTypeCustom];
    _applyBetaButton.frame = CGRectMake(kButtonHorizontalMargin, RectHeightExclude(self.view.bounds, (kButtonHeight + kButtonBottomMargin + kButtonHeight + kButtonBetweenMargin)), RectWidthExclude(self.view.bounds, kButtonHorizontalMargin * 2), kButtonHeight);
    [_applyBetaButton setTitle:STR(@"申请内测，获取邀请码") forState:UIControlStateNormal];
    [_applyBetaButton setTitleColor:CUTE_MAIN_COLOR forState:UIControlStateNormal];
    _applyBetaButton.titleLabel.font = [UIFont systemFontOfSize:14];
    [self.view addSubview:_applyBetaButton];
    [_applyBetaButton addTarget:self action:@selector(onApplyBetaButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [_applyBetaButton setHidden:YES];

    [_pagingView reloadWithPageCount:kPageCount];
}


#define kContentHeight 342

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    [_pagingView updateFrame:self.view.bounds];
    _pageIndicator.frame = CGRectMake(0, RectHeightExclude(self.view.bounds, kContentHeight) / 2 + kContentHeight, RectWidth(self.view.bounds), kPageIndicatorHeight);
    _enterButton.frame = CGRectMake(kButtonHorizontalMargin, _pageIndicator.frame.origin.y + kButtonTopMargin, RectWidthExclude(self.view.bounds, kButtonHorizontalMargin * 2), kButtonHeight);
    _applyBetaButton.frame = CGRectMake(kButtonHorizontalMargin, _pageIndicator.frame.origin.y + kButtonTopMargin + kButtonBetweenMargin + kButtonHeight, RectWidthExclude(self.view.bounds, kButtonHorizontalMargin * 2), kButtonHeight);
}

- (void)onEnterButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:NO completion:^{
        if (self.completion) {
            self.completion();
        }
    }];
}

- (void)onApplyBetaButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:NO completion:^{
        if (self.applyBetaCompletion) {
            self.applyBetaCompletion();
        }
    }];
}

#pragma mark - BBTPagingViewDataSource

- (UIView *)pageViewAtIndex:(NSInteger)index {

    UIView *view = [[UIView alloc] initWithFrame:_pagingView.bounds];
    view.backgroundColor = HEXCOLOR(0xf0e8d4, 1);
    UIImageView *imageView = [[UIImageView alloc] init];
    NSString *imageName = [NSString stringWithFormat:@"img-splash-%d", (index + 1)];
    imageView.image = IMAGE(imageName);
    [view addSubview:imageView];
    CGSize imageSize = imageView.image.size;
    imageView.frame = CGRectMake(RectWidthExclude(view.bounds, imageSize.width) / 2 , RectHeightExclude(_pagingView.bounds, kContentHeight) / 2, imageSize.width, imageSize.height);

    UILabel *label = [UILabel new];
    label.textColor = CUTE_MAIN_COLOR;
    label.font = [UIFont boldSystemFontOfSize:20];
    label.textAlignment = NSTextAlignmentCenter;
    [view addSubview:label];
    label.frame = CGRectMake(10, imageView.frame.origin.y + imageView.frame.size.height + 14, RectWidthExclude(_pagingView.bounds, 20), 20);
    label.text = @[STR(@"房东直租工具"),
                   STR(@"杂志般的房产展示"),
                   STR(@"一次发布，传遍全英")][index];

    UILabel *detailLabel = [UILabel new];
    detailLabel.textColor = HEXCOLOR(0x666666, 1);
    detailLabel.font = [UIFont systemFontOfSize:14];
    detailLabel.textAlignment = NSTextAlignmentCenter;
    [view addSubview:detailLabel];
    detailLabel.frame = CGRectMake(10, label.frame.origin.y + label.frame.size.height + 10, RectWidthExclude(_pagingView.bounds, 20), 20);
    detailLabel.text = @[STR(@"三步发布出租房，不用费力思考"),
                         STR(@"分享至朋友圈，高大上的阅读体验"),
                         STR(@"全国各大平台均可看到你的房产信息")][index];

    return view;
}

#pragma mark - BBTPagingViewDelegate

- (void)onPagingViewScrollToIndex:(NSInteger)index {
    [_pageIndicator setCurrentPage:index];

    if (kPageCount - 1 != index) {
        [UIView animateWithDuration:0.2 animations:^{
            _enterButton.alpha = 0;
            _applyBetaButton.alpha = 0;
        } completion:^(BOOL finished) {
            [_enterButton setHidden:YES];
            [_applyBetaButton setHidden:YES];
        }];
    }
    else {
        [_enterButton setHidden:NO];
        [_applyBetaButton setHidden:NO];
        [UIView animateWithDuration:0.2 animations:^{
            _enterButton.alpha = 1;
            _applyBetaButton.alpha = 1;
        } completion:^(BOOL finished) {
        }];
    }

}

@end
