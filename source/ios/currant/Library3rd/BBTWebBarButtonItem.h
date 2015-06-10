//
//  OCBarButtonItem.h
//
//  Created by Olivier Collet on 11-10-24.
//  Copyright (c) 2011 Olivier Collet. All rights reserved.
//

#import <UIKit/UIKit.h>

typedef void (^BBTActionBlock) (UIViewController*);


@interface BBTWebBarButtonItem : UIBarButtonItem

+ (id)itemWithBarButtonSystemItem:(UIBarButtonSystemItem)systemItem actionBlock:(BBTActionBlock)actionBlock;
+ (id)itemWithCustomView:(UIView *)customView actionBlock:(BBTActionBlock)actionBlock;
+ (id)itemWithImage:(UIImage *)image style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock;
+ (id)itemWithImage:(UIImage *)image landscapeImagePhone:(UIImage *)landscapeImagePhone style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock __OSX_AVAILABLE_STARTING(__MAC_NA,__IPHONE_5_0); // landscapeImagePhone will be used for the bar button image in landscape bars in UIUserInterfaceIdiomPhone only
+ (id)itemWithTitle:(NSString *)title style:(UIBarButtonItemStyle)style actionBlock:(BBTActionBlock)actionBlock;

- (void)setActionBlock:(BBTActionBlock)actionBlock;

@property (nonatomic, weak) UIViewController *viewController;


@end
