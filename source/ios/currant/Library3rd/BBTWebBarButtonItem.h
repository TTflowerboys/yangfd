//
//  OCBarButtonItem.h
//
//  Created by Olivier Collet on 11-10-24.
//  Copyright (c) 2011 Olivier Collet. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface BBTWebBarButtonItem : UIBarButtonItem

+ (id)itemWithBarButtonSystemItem:(UIBarButtonSystemItem)systemItem actionBlock:(void (^)(UIWebView *webView))actionBlock;
+ (id)itemWithCustomView:(UIView *)customView actionBlock:(void (^)(UIWebView *webView))actionBlock;
+ (id)itemWithImage:(UIImage *)image style:(UIBarButtonItemStyle)style actionBlock:(void (^)(UIWebView *webView))actionBlock;
+ (id)itemWithImage:(UIImage *)image landscapeImagePhone:(UIImage *)landscapeImagePhone style:(UIBarButtonItemStyle)style actionBlock:(void (^)(UIWebView *webView))actionBlock __OSX_AVAILABLE_STARTING(__MAC_NA,__IPHONE_5_0); // landscapeImagePhone will be used for the bar button image in landscape bars in UIUserInterfaceIdiomPhone only
+ (id)itemWithTitle:(NSString *)title style:(UIBarButtonItemStyle)style actionBlock:(void (^)(UIWebView *webView))actionBlock;

- (void)setActionBlock:(void (^)(UIWebView *webView))actionBlock;

@property (nonatomic, retain) UIWebView *webView;


@end
