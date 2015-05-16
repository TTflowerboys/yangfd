//
//  BPLPagingView.h
//  BluePlate
//
//  Created by Foster Yin on 12/30/13.
//  Copyright (c) 2013 Brothers Bridge Technology. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol BBTPagingViewViewDataSource <NSObject>

- (UIView *)pageViewAtIndex:(NSInteger)index;

@end


@protocol BBTPagingViewViewDelegate <NSObject>

- (void)onPagingViewScrollToIndex:(NSInteger)index;

@end

@interface BBTPagingView : UIView

@property (nonatomic, weak) id<BBTPagingViewViewDataSource> dateSource;

@property (nonatomic, weak) id<BBTPagingViewViewDelegate> delegate;

- (void)reloadWithPageCount:(NSInteger)pageCount;

- (void)gotoPageAtIndex:(NSInteger)index animated:(BOOL)animated;

- (void)reloadPageAtIndex:(NSInteger)index;

- (void)setScrollEnabled:(BOOL)enable;

- (void)updateFrame:(CGRect)frame;

@end
