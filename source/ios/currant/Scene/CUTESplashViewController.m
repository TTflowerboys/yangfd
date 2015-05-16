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
#define kButtonHeight 50
#define kButtonHorizontalMargin 50
#define kButtonBottomMargin 40


#define kPageCount 3

@interface CUTESplashViewController () <BBTPagingViewViewDelegate, BBTPagingViewViewDataSource> {

    BBTPagingView *_pagingView;

    UIButton *_enterButton;

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
    [_enterButton setTitle:STR(@"进入应用") forState:UIControlStateNormal];
    _enterButton.layer.borderColor = CUTE_MAIN_COLOR.CGColor;
    _enterButton.layer.borderWidth = 1;
    _enterButton.layer.cornerRadius = 6;
    [self.view addSubview:_enterButton];
    [_enterButton addTarget:self action:@selector(onEnterButtonPressed:) forControlEvents:UIControlEventTouchUpInside];
    [_enterButton setHidden:YES];

    [_pagingView reloadWithPageCount:kPageCount];
}



- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    [_pagingView updateFrame:self.view.bounds];
    _pageIndicator.frame = CGRectMake(0, RectHeightExclude(self.view.bounds, (kButtonHeight + kButtonBottomMargin + kPageIndicatorBottomMargin)), RectWidth(self.view.bounds), kPageIndicatorHeight);
    _enterButton.frame = CGRectMake(kButtonHorizontalMargin, RectHeightExclude(self.view.bounds, (kButtonHeight + kButtonBottomMargin)), RectWidthExclude(self.view.bounds, kButtonHorizontalMargin * 2), kButtonHeight);
}

- (void)onEnterButtonPressed:(id)sender {
    [self dismissViewControllerAnimated:NO completion:^{}];
}

#pragma mark - BBTPagingViewDataSource

- (UIView *)pageViewAtIndex:(NSInteger)index {

    BBTCenterImageView *imageView = [[BBTCenterImageView alloc] initWithFrame:_pagingView.bounds];
    imageView.backgroundColor = HEXCOLOR(0xf0e8d4, 1);
    NSString *imageName = [NSString stringWithFormat:@"img-splash-%d", (index + 1)];
    imageView.imageView.image = IMAGE(imageName);
    return imageView;
}

#pragma mark - BBTPagingViewDelegate

- (void)onPagingViewScrollToIndex:(NSInteger)index {
    [_pageIndicator setCurrentPage:index];
    [_enterButton setHidden:kPageCount - 1 != index];
}

@end
