//
//  CUTERentTypeListViewController.h
//  currant
//
//  Created by Foster Yin on 3/31/15.
//  Copyright (c) 2015 Foster Yin. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "FXForms.h"
#import "CUTETicket.h"
#import "CUTEFormViewController.h"

@protocol CUTERoutable;

@interface CUTERentTypeListViewController : CUTEFormViewController <CUTERoutable>


@property (nonatomic, copy) dispatch_block_t updateRentTypeCompletion;


@end
