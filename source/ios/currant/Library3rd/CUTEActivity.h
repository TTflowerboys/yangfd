//
//  CUTEActivity.h
//  currant
//
//  Created by Foster Yin on 7/24/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CUTEActivity : NSObject

@property (nonatomic, copy) NSString *activityType;

@property (nonatomic, copy) NSString *activityTitle;

@property (strong, nonatomic) UIImage *activityImage;

@property (nonatomic, copy) dispatch_block_t performActivityBlock;

@end


