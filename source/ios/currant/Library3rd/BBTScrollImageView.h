//
//  TICScrollImageView.h
//  TheIndiCard
//
//  Created by Andy on 14-6-25.
//  Copyright (c) 2014年 BBT. All rights reserved.
//

#import <UIKit/UIKit.h>

@protocol BBTScrollImageViewDelegate <NSObject>

@optional

- (void)scrollView:(UIScrollView *)scrollView didTapImageAtIndex:(NSInteger)index;

@end

@interface BBTScrollImageView : UIScrollView

@property (nonatomic, assign) id <BBTScrollImageViewDelegate> scrollImageDelegate;

- (void)setImages:(NSArray *)imagesArray;

@end
