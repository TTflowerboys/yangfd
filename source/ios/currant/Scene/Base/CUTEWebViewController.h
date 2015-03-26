//
//  CUTEWebViewController.h
//  currant
//
//  Created by Foster Yin on 3/21/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CUTEWebViewController : UIViewController <UIWebViewDelegate>

@property (strong, nonatomic) NSString *urlPath;

@property (nonatomic, readonly) UIWebView *webView;


- (void)loadURLPath:(NSString *)urlPath;

- (void)onPhoneButtonPressed:(id)sender;

- (void)updateBackButton;

- (void)clearBackButton;

@end
