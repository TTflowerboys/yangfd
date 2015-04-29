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

@interface CUTERentTypeListViewController : FXFormViewController

@property (nonatomic, strong) CUTETicket *ticket;

@property (nonatomic) BOOL singleUseForReedit;

@end
