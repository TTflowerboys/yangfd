//
//  CUTEViewController.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CUTEViewController : UIViewController

 //TODO refine the url 
@property (strong, nonatomic) NSURL *url;

//If user need login the url is the redirected url, the originalURL is the origianl url, else is the url
@property (nonatomic, readonly) NSURL *originalURL;


@end
